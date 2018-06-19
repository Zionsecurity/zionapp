var mongoose = require('mongoose');
var Alert = require('../../models/alert');
var escape = require('escape-html');
var sanitizeHtml = require('sanitize-html');
var mailchimp = require('../../lib/mailchimp')
var notification = require('../../lib/notification')

// Display all alerts
exports.alert_list = function(req, res) {
    Alert.find({}, '', function (err, alerts) {
        if (err) if (err) return handleError(err);
            res.render('alertList', { alerts });
    })
};

// Display Alert create form on GET
exports.alert_create_get = function(req, res) {
    res.render('alertCreate')
};

// Handle Alert create on POST
exports.alert_create_post = function(req, res) {

    req.checkBody('title', 'Title required').notEmpty();
    req.checkBody('content', 'Content required').notEmpty();

    req.sanitizeBody('title').escape();

    // disabled escaping of the content so it will be displayed nicely for the user
    // however, XSS is possible! we assume the content creator is an admin...
    //req.sanitizeBody('content').escape();

    var errors = req.validationErrors();
    if (errors) {
        res.render('alertCreate', { errors })
    }
    else {

        var title = req.body.title;
        var content = req.body.content;
        var tags = JSON.parse(req.body.tags);

        var tagIds = tags.map(function(tag) {
            return tag.id;
        });

        mailchimp.createTemplate(title, content)
        .then((res) =>  {
            Alert.create({
                    title: title,
                    mailchimp_id: res.id,
                    tags: tagIds,
                    content: content
                })
            })
        .then(() => res.redirect('../'))
        .catch((err) => console.log(err))
    }
};

// Handle Alert create on POST
exports.alert_view = function(req, res) {
    var id = req.params.id;
    Alert.findById(id, function (err, alert) {
        if (err || alert == null) {
            res.redirect('/')
        } else {
            mailchimp.getGroups(alert.tags)
            .then((tags) => {
                res.render('alertView', { alert, tags });
            })
        }
    })
};

exports.alert_edit = function(req, res) {
    var id = req.params.id;
    req.sanitizeBody('title').escape();

    var title = req.body.title;
    var content = req.body.content;
    var tags = JSON.parse(req.body.tags);

    var tagIds = tags.map(function(tag) {
        return tag.id;
    });

    Alert.findById(id)
    .then((alert) => mailchimp.editTemplate(alert.mailchimp_id, title, content))
    .then(() => Alert.findByIdAndUpdate(id, { $set: { title: title, content: content, tags: tagIds }}))
    .catch((err) => console.error(err));
};


// Handle Alert create on POST
exports.alert_publish = function(req, res) {
    var id = req.params.id;
    var alert;
    Alert.findById(id)
    .then((_alert) => {
        alert = _alert;
        if (alert.published) {
            const error = new Error("Alert has already been published...");
            return Promise.reject(error);
        }
        return notification.notifyAllClients(alert);
    })
    .catch((err) => {
        var error;
        if (err.code == 'ENOTFOUND') {
            error = 'Can\'t access Mailchimp servers'
        } else if (err.detail) {
            error = err.detail
        } else {
            error = err.message
        }
        mailchimp.getGroups(alert.tags)
        .then((tags) => {
            res.render('alertView', { alert, tags, error });
        })
    })
    .then(() => Alert.findByIdAndUpdate(id, { $set: { published: true }}))
    .then(() => res.redirect('/'))
    .catch((err) => console.error(err));
};


