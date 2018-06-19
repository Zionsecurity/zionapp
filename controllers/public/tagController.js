var mailchimp = require('../../lib/mailchimp');

exports.get_tags = function(req, res) {
    mailchimp.getAllGroups()
    .then((groups) => {
        var tags = groups.interests.map(function(tag) {
            return {id: tag.id, name: tag.name}
        })
        res.status(200).json(tags);
    })
}