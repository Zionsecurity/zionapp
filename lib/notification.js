var mailchimp = require('./mailchimp')
var firebase = require('./firebase')


notifyMobile = function(alert) {
    return firebase.pushNotifications(alert);
}

notifyEmail = function(alert) {
    return mailchimp.publishTemplate(alert)
}

exports.notifyAllClients = function(alert) {
    
    return notifyMobile(alert)
    .then((res) => notifyEmail(alert));
    
    
    //return mailchimp.publishTemplate(alert);
    //NOTE: comment above and uncomment this line to test mailing
}