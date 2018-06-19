var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var alertSchema = new Schema({
    title: String,
    content: String,
    mailchimp_id: String,
    tags: [String],
    date: {
        type: Date,
        default: Date.now
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium'
    },
    published: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Alert', alertSchema);