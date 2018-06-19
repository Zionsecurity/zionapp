var express = require('express');
var passport = require('passport');
var user = express.Router();

var user_controller = require('../../controllers/public/userController');

user.post('/login', user_controller.login_user);
user.post('/register', user_controller.register_user);
user.get('/verify/:verificationToken', user_controller.verify_user);
user.post('/verify', user_controller.send_verification);


user.get('/', passport.authenticate('bearer', { session: false }), user_controller.get_user);
user.post('/update', passport.authenticate('bearer', { session: false }), user_controller.update_user);
user.post('/password', passport.authenticate('bearer', { session: false }), user_controller.update_password);



module.exports = user;
