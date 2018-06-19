var fetch = require('isomorphic-fetch');
var config = require('../config');


const apiCall = (url, options = {}) => {
    return fetch(url, options)
    .then(response => {
        if (response.status >= 400) {
            return Promise.reject('Invalid response');
        }
        //console.log(response.json());
        return response.json();
    })
};


const pushNotification = function(alert, tag) {
    var body = {
        'notification': {
            'title': config.notification.title,
            'body': alert.title,
            'sound': 'default',
            'click_action': 'FCM_PLUGIN_ACTIVITY',
            'icon': 'fcm_push_icon'
        },
        'to': '/topics/'+tag,
        'priority':  'high',
        'restricted_package_name': ''
    }
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${config.firebase.api_key}`
        },
        body: JSON.stringify(body)
    }
    return apiCall(config.firebase.url, options)
}

exports.pushNotifications = function(alert) {
    return Promise.all(alert.tags.map(function(tag) {
        pushNotification(alert, tag);
    }));
}