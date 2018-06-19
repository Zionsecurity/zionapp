var fetch = require('isomorphic-fetch');
var xml2js = require('xml2js');
var cheerio = require('cheerio')
var Promise = require('bluebird');

var config = require('../config');


exports.getBlogposts = function() {
    return fetch(config.zion.rss_url)
        .then(res => res.text())
        .then(Promise.promisify(xml2js.parseString))
        .then(res => {
            var blogs = res.rss.channel[0].item;
            blogs.map(function(blog) {
                const id = parseInt(blog['guid'][0]['_'])
                blog.id = id;
            })
            return blogs;
        })
}

exports.getBlogpost = function(id) {
    return fetch(`${config.zion.blog_url}/${id}`)
        .then(res => res.text())
        .then(html => {
            console.log(html)
            const $ = cheerio.load(html)
            $('img').not('[src^="http"],[src^="https"]').each(function() {
                $(this).attr('src', function(index, value) {
                    return "https://zionsecurity.com" + value;
                });
            })
            $('img').each(function() {
                $(this).css({'max-width': '100% !important', 'height': 'auto !important' });
            })
            $('pre').each(function() {
                $(this).css({'white-space': 'pre-wrap' });
            });
            $('a').each(function() {
                $(this).css({
                    'white-space': 'pre-wrap',
                    'white-space': '-moz-pre-wrap',
                    'white-space': '-pre-wrap',
                    'white-space': '-o-pre-wrap',
                    'word-wrap': 'break-word',
					'pointer-events': 'none',
					'cursor': 'default',
					'text-decoration': 'none',
					'color': 'black',					
                });
                $(this).attr('href', function(index, value) {
                    if (value && value.startsWith('/')) {
                        $(this).css({'cursor': 'pointer', 'pointer-events' : 'none'});
                    }
                });
            });
            $('table').each(function() {
                $(this).attr('width', function(index, value) {
                    return "100%"
                });
                $(this).removeAttr('style');
            });
            const article = $('article .content').html();
            return {id: id, content: article}
        })
}

