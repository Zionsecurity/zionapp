var express = require('express');
var alerts = express.Router();

var alert_controller = require('../../controllers/public/alertController');

alerts.get('/', alert_controller.alert_list);


module.exports = alerts;
