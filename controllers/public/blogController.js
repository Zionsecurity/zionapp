var zion = require('../../lib/zion');


exports.blogs_list = function(req, res) {
    zion.getBlogposts()
    .then((blogs) => {
        res.status(200).json(blogs);
    })
}

exports.get_blog = function(req, res) {
    const id = req.params.id;
    zion.getBlogpost(id)
    .then((blog) => {
        res.status(200).json(blog);
    })
}