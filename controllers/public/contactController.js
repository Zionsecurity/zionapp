var mailer = require('../../lib/mailer');
var User = require('../../models/user');
var request = require('request');
var config = require('../../config.js');

exports.sendContact = function(req, res) {

	var email = req.body.email;    
	var subject = req.body.subject;
	var content = req.body.content;
	
	var secretKey = config.captcha.key;
	var captcha = req.body.captcha;
	
	if (captcha === undefined || 
		captcha === '' || 
		captcha === null) {
			res.json({success: false, message: 'Please select Captcha'});
	}
	
	console.log("Server verifying captcha");
	var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + captcha;
	request(verificationUrl,function(error,response,body) {
		body = JSON.parse(body);
		if(body.success !== undefined && !body.success) {
			console.log("Server captcha failed");
			res.json({success: false, message: 'Failed Captcha verification'});
		} else {
			console.log("Server captcha success");
			mailer.sendContactEmail(email, subject, content);	
			res.json({success: true, message: 'Message send successfully'});
		}
	});
}
	
	
	


