var mailchimp = require('../../lib/mailchimp')


exports.tag_list = function(req, res) {
    mailchimp.getAllGroups()
    .then((groups) => {
        var tags = groups.interests.map(function(group) {
            return {tag: group.name, id: group.id}
        })
        .reduce(function(acc, cur) {
            acc[cur.tag] = cur;
            return acc;
        }, {});
        res.json(tags);
    })
    .catch((err) => console.error(err));
}