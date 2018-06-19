var nodemailer = require('nodemailer');
var config = require('../config');


let transporter = nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.port,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.mailer.email,
        pass: config.mailer.password
    }
});

sendEmail = function(mailOptions) {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}


exports.sendVerificationEmail = function(email, token) {
    var link = `http://${config.server.host}:${config.server.port}/api/user/verify/${token}`
    var mailOptions = {
        from: `Zion Security <${config.mailer.email}>`,
        to: email,
        subject: 'Please confirm your account',
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    };
    sendEmail(mailOptions);
}

exports.sendContactEmail = function(email, subject, content) {
    
	console.log("mailer sends email: "+email+", "+subject+", "+content);
	
    var mailOptions = {
        from: `Zion Security <${config.mailer.email}>`,
        to: 'Steven.vandenbulcke@skynet.be',
        subject: "Contact message from ZionAlert app: "+subject,
        html: "Message relayed from: "+email+"<br/><br/>"+"Content:<br/><br/>"+content
    };
    sendEmail(mailOptions);
}
