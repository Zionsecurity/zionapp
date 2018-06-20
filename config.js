var config = {};


config.server = {
    //host: '192.168.1.37', //'192.168.30.34',
	host: '127.0.0.1',//NOTE: temporary for development
    port: process.env.PORT || 8080,//NOTE was 3000
    key: __dirname + '/ssl/key.pem',
    cert: __dirname + '/ssl/cert.pem',
    passphrase: 'zionsecurity'
}

config.mongodb = {
    dbName: 'zionapp',
	key: 'hdoVSceccloEdi9UWzfkCKtVddGE3OFpA0Nbcmb1MGmUMGodOTINFPe6XlsGmiUabCjhLeEjXvBobT7VbD3U2w==',
	port: '10255',	
	URI: 'mongodb://zionapp:hdoVSceccloEdi9UWzfkCKtVddGE3OFpA0Nbcmb1MGmUMGodOTINFPe6XlsGmiUabCjhLeEjXvBobT7VbD3U2w==@zionapp.documents.azure.com:10255/?ssl=true&replicaSet=globaldb'
}

config.mailer = {
    host: 'smtp.zoho.eu',
    port: 465,
    email: "zionapp@zionlabs.be",
    password: "):*tFxCasC]#]#rN8E+Jv..VetGYryfWX]CEr!j&",
}

config.bearer = {
    secret: '98DyXe8G7q9CVZg9h26da9bYJA4BMx',
    expires: '1y' //timespan epxressed in zeit/ms
}

config.mailchimp = {
    api_key: 'a86ce8c16c96f4dd528769e7757b9088-us12',//NOTE:  for account steven.vandenbulcke@zionsecurity.com
    campaign_title: 'Zion Alert',
    from_name: 'Zion Security',
    reply_to: 'steven.vandenbulcke@skynet.be',//NOTE: temporary
    teamleader_list_id: '3f1c5e927f',//NOTE: from steven mailchimp "Teamleader" list
    zion_app_list_id: '8011af8eeb',//NOTE: from steven mailchimp "Zion App" list
    interests_id: '0fe0a9c685'//NOTE: from steven mailchimp "Zion App" list, Interests group (developer.mailchimp.com-->Playground-->lists-->interest-categories-->interests)
}

config.firebase = {
    url: 'https://fcm.googleapis.com/fcm/send',
    api_key: 'AIzaSyCzXyTT-rkm9lzgOwqbvIK0ebNEYPVVJN0'//NOTE: From zionalertapp@gmail.com  firebase google account
}

config.zion = {
    rss_url: 'https://www.zionsecurity.com/rss.xml',
    blog_url: 'https://www.zionsecurity.com/node'
}

config.notification = {
    title: 'Zion alert'
}

config.captcha = {
	key: '6LfBE18UAAAAACvpXOOEl8BZAU7akWoFAcD8kO8J'
}

module.exports = config;
