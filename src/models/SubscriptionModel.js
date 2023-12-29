var mongoose = require('mongoose');

var SubscriptionSchema = mongoose.Schema({
    plan_name: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('subscriptions', SubscriptionSchema);