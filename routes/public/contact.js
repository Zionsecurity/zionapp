var express = require('express');
var passport = require('passport');
var contact = express.Router();

var contact_controller = require('../../controllers/public/contactController');

contact.post('/contact', contact_controller.sendContact);

module.exports = contact;
