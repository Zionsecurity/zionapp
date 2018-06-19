var express = require('express');
var upload = express.Router();
var multipart = require('connect-multiparty');


var upload_controller = require('../../controllers/local/uploadController');
var multipartMiddleware = multipart();

upload.post('/', multipartMiddleware, upload_controller.alert_upload_image);


module.exports = upload;