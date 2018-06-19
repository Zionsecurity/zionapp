var Alert = require('../../models/alert');


exports.alert_list = function(req, res) {
    Alert.find({}, '', function (err, alerts) {
        if (err) if (err) return handleError(err);
            res.status(200).json(alerts);
    })
}