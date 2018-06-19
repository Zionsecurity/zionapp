//rename this file to config.js

var config = {};


config.server = {
    host: '127.0.0.1',
    port: process.env.PORT || 443,
    key: //location to key.pem',
    cert: //location to cert.pem',
    passphrase: //passphrase of cert
}

config.mongodb = {
    host: '127.0.0.1',
    port: 27017,
    db: 'zionapp'
}

config.email = {
    address: "zionapp@zionlabs.be",
    password: "):*tFxCasC]#]#rN8E+Jv..VetGYryfWX]CEr!j&"
}

config.bearer = {
    secret: '', //secret to sign & verify JWT tokens
    expires: '1y' //timespan epxressed in zeit/ms
}

config.mailchimp = {
    api_key: //your mailchimp API key,
    campaign_title: 'Zion Alert',
    from_name: 'Zion Security'
    reply_to: 'info@zionsecurity.com',
    teamleader_list_id: //list id of the recipients list who didn't install the app
    zion_app_list_id: //list id of the recipients list who installed the app
    interests_id: //id of the set of groups (tags) ,
}

config.firebase = {
    url: 'https://fcm.googleapis.com/fcm/send',
    api_key: //api key of firebase project
}

config.zion = {
    rss_url: 'https://www.zionsecurity.com/rss.xml',
    blog_url: 'https://www.zionsecurity.com/node'
}

config.notification = {
    title: 'Zion alert'
}


module.exports = config;