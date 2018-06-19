var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    tags: [String],
    notifyEmail: {
        type: Boolean,
        default: true
    },
    notifyMobile: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String //token for email verification
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    errorMessages: {
        IncorrectPasswordError: 'Password or email are incorrect',
        IncorrectUsernameError: 'Password or email are incorrect',
        MissingUsernameError: 'No email was given',
        UserExistsError: 'A user with the given email is already registered'
    }
});

module.exports = mongoose.model('User', userSchema);