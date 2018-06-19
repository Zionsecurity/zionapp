var express = require('express');
var index = express.Router();

var alerts = require('./alerts');
var tags = require('./tags');
var blogs = require('./blogs');
var user = require('./user');
var contact = require('./contact');


index.get('/', function(req, res) {
    res.send('Welcome to the Zion API');
});

index.post('*', function(req, res, next) {
  var contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0)
    return res.sendStatus(400);
  next();
});

index.use('/alerts', alerts);
index.use('/tags', tags);
index.use('/blogs', blogs);
index.use('/user', user);
index.use('/contact', contact);

index.use(function(req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.json(err);
});



module.exports = index;