var express = require('express');
var tags = express.Router();

var tag_controller = require('../../controllers/public/tagController');

tags.get('/', tag_controller.get_tags);


module.exports = tags;