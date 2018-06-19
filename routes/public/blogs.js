var express = require('express');
var blogs = express.Router();

var blog_controller = require('../../controllers/public/blogController');

blogs.get('/', blog_controller.blogs_list);
blogs.get('/:id', blog_controller.get_blog);


module.exports = blogs;