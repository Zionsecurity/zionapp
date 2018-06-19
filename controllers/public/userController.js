var passport = require('passport');
var validator = require('validator');
var mailchimp = require('../../lib/mailchimp');
var mailer = require('../../lib/mailer');
var User = require('../../models/user');
var config = require('../../config');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

sanitizeUser = function(user) {
    //removes the private fields of the user which are stored in mongodb (such as _id)
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        notifyEmail: user.notifyEmail,
        notifyMobile: user.notifyMobile,
        tags: user.tags
    }
}

createToken = function(user) {
    return jwt.sign(
        { id: user._id },
        config.bearer.secret,
        { expiresIn: config.bearer.expires }
    );
}


exports.get_user = function(req, res) {
    const isAuthenticated = req.authInfo.auth;
    const user = req.user
    if (isAuthenticated) {
        res.json({
            success: true,
            user: this.sanitizeUser(user)
        })
    } else {
        res.json({
            success: false,
            message: 'not authorized'
        });
    }
}

exports.login_user = function(req, res) {

    //VALIDATION
    var errorMessage = ''

    req.checkBody("email").notEmpty();
    req.checkBody("password").notEmpty();
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Please fill in all fields'}

    req.checkBody("email").isEmail();
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid email address'}

    if (errorMessage) {
        return res.json({
            success: false,
            message: errorMessage
        })
    } else {
        return User.authenticate('local')(
            req.body.email,
            req.body.password,
            function (err, user, options) {
                if (err) return next(err);
                if (user === false) {
                    res.json({
                        success: false,
                        message: options.message
                    });
                } else {
                    if (!user.emailVerified) {
                        res.json({
                            success: false,
                            message: 'Please verify your email'
                        });
                    } else {
                        const token = this.createToken(user);
                        res.json({
                            success: true,
                            token: token
                        });
                    }
                }
            });
    }
}

exports.update_user = function(req, res) {
    //check if authenticated
    const isAuthenticated = req.authInfo.auth;
    const user = req.user
    if (isAuthenticated) {

        mailchimp.getAllGroups()
        .then((groups) => {

            //FETCH VALID TAGS
            var tags = groups.interests.map(function(tag) {
                return tag.id
            })

            //VALIDATION
            var errorMessage = ''

            req.checkBody("firstName").notEmpty()
            req.checkBody("lastName").notEmpty()
            req.checkBody("notifyEmail").notEmpty();
            req.checkBody("notifyMobile").notEmpty();
            req.checkBody("tags").exists();
            if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Please fill in all fields'}

            req.checkBody("firstName").isAlpha();
            req.checkBody("lastName").isAlpha();
            if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid firstname or lastname'}

            req.checkBody("notifyEmail").isBoolean();
            req.checkBody("notifyMobile").isBoolean();
            if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid notification settings'}

            req.checkBody("tags").whitelist(tags);
            if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid tags'}

            if (errorMessage) {
                return res.json({
                    success: false,
                    message: errorMessage
                })
            } else {

                //SANITAZATION
                req.sanitizeBody('firstName').escape();
                req.sanitizeBody('lastName').escape();

                const updateUser = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    notifyEmail: req.body.notifyEmail,
                    notifyMobile: req.body.notifyMobile,
                    tags: req.body.tags
                }
                var tagList = {}
                tags.forEach(function(tag) {
                    tagList[tag] = false;
                })
                updateUser.tags.forEach(function(tag) {
                    tagList[tag] = true;
                })
                return User.findByIdAndUpdate(user._id, { $set: updateUser }, {new: true}, function(err, updatedUser) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err.message
                        });
                    } else {
                        if (updatedUser.notifyEmail) {
                            mailchimp.subscribeInZionList(updatedUser);
                        } else {
                            mailchimp.unsubscribeInZionList(updatedUser);
                        }
                        mailchimp.syncTags(updatedUser, tagList);
                        res.json({
                            success: true,
                            user: this.sanitizeUser(updatedUser)
                        });
                    }
                })

            }
        })
    } else {
        return res.json({
            success: false,
            message: 'not authorized'
        });
    }

}

exports.register_user = function(req, res) {

    //VALIDATION
    var errorMessage = ''

    req.checkBody("firstName").notEmpty()
    req.checkBody("lastName").notEmpty()
    req.checkBody("email").notEmpty();
    req.checkBody("password").notEmpty();
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Please fill in all fields'}

    req.checkBody("firstName").isAlpha();
    req.checkBody("lastName").isAlpha();
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid firstname or lastname'}

    req.checkBody("email").isEmail();
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid email address'}

    req.checkBody("password").isLength({min:7, max: 255})
    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Password must contain at least 7 characters'}

    if (errorMessage) {
        return res.json({
            success: false,
            message: errorMessage
        })
    } else {

        //SANITAZATION
        req.sanitizeBody('firstName').escape();
        req.sanitizeBody('lastName').escape();


        //EMAIL VERIFICATION TOKEN
        var verificationToken = crypto.randomBytes(32).toString('hex');


        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            verificationToken: verificationToken
        })

        return User.register(newUser, req.body.password, function(err, user) {

            if (err) {
                res.json({
                    success: false,
                    message: err.message
                })
            } else {
                //If user registers with his email, move them from teamleader to zion app list in mailchimp
                mailchimp.moveFromTeamLeaderToZionList(user);
                mailer.sendVerificationEmail(user.email, verificationToken);
                //const token = this.createToken(user);
                res.json({
                    success: true,
                    message: 'Succesfully registered'
                });
            }
        });

    }
}

exports.verify_user = function(req, res) {
    var verificationToken = req.params.verificationToken;

    User.find({}, { _id: 1, emailVerified: 1, verificationToken: 1 }, function(err, users) {
        let verificationChecks = users.map(function(user) {
            return new Promise((resolve) => {

                if (verificationToken == user.verificationToken) {
                    if (!user.emailVerified) {
                        User.findByIdAndUpdate(user._id, { $set: { emailVerified: true } }, {new: true}, function(err, updatedUser) {
                            if (err) {
                                resolve({
                                    success: false,
                                    message: err.message
                                });
                            } else {
                                resolve({
                                    success: true,
                                    message: 'Account verified'
                                });
                            }
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Account already verified'
                        });
                    }
                } else {
                    resolve(false)
                }
            });
        });

        Promise.all(verificationChecks)
        .then((results) => {
            var json;
            var messages = results.filter(userResult => userResult);
            if (messages.length == 0) {
                json = {
                    success: false,
                    message: 'Invalid token'
                }
            } else {
                json = messages[0];
            }
            res.send(json.message);
        });
    })
}

exports.send_verification = function(req, res) {

    var errorMessage = ''

    req.checkBody("email").notEmpty();
    req.checkBody("email").isEmail();

    if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Invalid email address'}

    if (errorMessage) {
        return res.json({
            success: false,
            message: errorMessage
        })
    } else {
        var email = req.body.email
        User.findOne({email: email}, function(err, user) {
            if (user) {
                mailer.sendVerificationEmail(user.email, user.verificationToken);
                return res.json({
                    success: true,
                    message: 'Verification email sent'
                })
            } else {
                return res.json({
                    success: false,
                    message: 'User not found'
                })
            }
        });
    }

}



exports.update_password = function(req, res) {
    //check if authenticated
    const isAuthenticated = req.authInfo.auth;
    const user = req.user
    if (isAuthenticated) {

        //VALIDATION
        var errorMessage = ''

        req.checkBody("oldPassword").notEmpty();
        req.checkBody("password").notEmpty();
        if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Please fill in all fields'}

        req.checkBody("password").isLength({min:7, max: 255})
        if (req.validationErrors()) {if (!errorMessage) errorMessage = 'Password must contain at least 7 characters'}

        if (errorMessage) {
            return res.json({
                success: false,
                message: errorMessage
            })
        } else {
            const oldPassword = req.body.oldPassword
            const newPassword = req.body.password
            return user.changePassword(oldPassword, newPassword, function(err, user) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Incorrect password'
                    });
                } else {
                    res.json({
                        success: true
                    });
                }
            });
        }

    } else {
        return res.json({
            success: false,
            message: 'not authorized'
        });
    }

}
