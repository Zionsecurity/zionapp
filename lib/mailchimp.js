var mailchimp = require('mailchimp-api-v3')
var config = require('../config');
var md5 = require('md5');


const apiKey = config.mailchimp.api_key;
const api = new mailchimp(apiKey);


getUserId = function(email) {
    var lowercase = email.toLowerCase();
    return md5(lowercase);
}

//Permanently deletes a user in a mailchimp list
removeUserFromList = function(user, listId) {
    var userId = getUserId(user.email);
    return api.delete({
        path: `/lists/${listId}/members/${userId}`
    })
}

addUserToList = function(user, listId) {
    return api.post({
        path: `/lists/${listId}/members/`,
        body: {
            'email_address': user.email,
            'status': 'subscribed',
            'merge_fields': {
                'FNAME': user.firstName,
                'LNAME': user.lastName
            }
        }
    })
}

//Unsubsribes a user in a mailchimp list. Will not receive an email but can always resubscribe
subscribeUserInList = function(user, listId) {
    var userId = getUserId(user.email);
    return api.patch({
        path: `/lists/${listId}/members/${userId}`,
        body: {
            'status': 'subscribed'
        }
    })
}

unsubscribeUserInList = function(user, listId) {
    var userId = getUserId(user.email);
    return api.patch({
        path: `/lists/${listId}/members/${userId}`,
        body: {
            'status': 'unsubscribed'
        }
    })
}

exports.moveFromTeamLeaderToZionList = function(user) {
    return addUserToList(user, config.mailchimp.zion_app_list_id)
    .then((res) => removeUserFromList(user, config.mailchimp.teamleader_list_id))
}

exports.subscribeInZionList = function(user) {
    subscribeUserInList(user, config.mailchimp.zion_app_list_id)
}

exports.unsubscribeInZionList = function(user) {
    unsubscribeUserInList(user, config.mailchimp.zion_app_list_id)
}

exports.syncTags = function(user, tags) {
    var userId = getUserId(user.email);
    return api.patch({
        path: `/lists/${config.mailchimp.zion_app_list_id}/members/${userId}`,
        body: {
            'interests': tags
        }
    })
}

exports.createTemplate = function(name, html) {
    return api.post({
        path: '/templates',
        body: {
            name: name,
            html: html
        }
    })
}

exports.editTemplate = function(id, name, html) {
    return api.patch({
        path: '/templates/' + id,
        body: {
            name: name,
            html: html
        }
    })
}

exports.publishTemplate = function(alert) {
    return api.post({
        path: '/campaigns',
        body: {
            type: 'regular',
            recipients: {
                list_id: config.mailchimp.zion_app_list_id,
                segment_opts: {
                    match: 'all',
                    conditions: [{
                        condition_type: 'Interests',
                        field: `interests-${config.mailchimp.interests_id}`,
                        op: 'interestcontains',
                        value: alert.tags
                    }]
                }
            },
            settings: {
                title: config.mailchimp.campaign_title,
                subject_line: 'Zion Alert',
                from_name: config.mailchimp.from_name,
                reply_to: config.mailchimp.reply_to,
                template_id: parseInt(alert.mailchimp_id)
            }
        }
    })
    .then((res) => api.post({path: `/campaigns/${res.id}/actions/send`}))
}


exports.getAllGroups = function() {
    return api.get({
        path: `/lists/${config.mailchimp.zion_app_list_id}/interest-categories/${config.mailchimp.interests_id}/interests`
    })
}

exports.getGroups = function(groupids) {
    var groups = [];
    return this.getAllGroups()
    .then((allGroups) => {
        allGroups.interests.forEach(function(group) {
            if (groupids.includes(group.id)) {
                groups.push(group.name)
            }
        })
        return groups
    })
}



