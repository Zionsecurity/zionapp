var express = require('express');
var tags = express.Router();

var tag_controller = require('../../controllers/local/tagController');

tags.get('/', tag_controller.tag_list);


module.exports = tags;