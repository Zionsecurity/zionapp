var express = require('express');
var index = express.Router();

var alerts = require('./alerts');
var tags = require('./tags');
var upload = require('./upload');


index.use('/alerts', alerts);
index.use('/tags', tags);
index.use('/upload', upload);


// Home page route
index.get('/', function(req, res) {
  //res.render('index');
  res.redirect('alerts')
});




module.exports = index;