var express = require('express');
var alerts = express.Router();

var alert_controller = require('../../controllers/local/alertController');

alerts.get('/', alert_controller.alert_list);

alerts.get('/create', alert_controller.alert_create_get);

alerts.post('/create', alert_controller.alert_create_post);

alerts.get('/:id', alert_controller.alert_view);

alerts.post('/:id', alert_controller.alert_edit);

alerts.post('/publish/:id', alert_controller.alert_publish);

module.exports = alerts;
