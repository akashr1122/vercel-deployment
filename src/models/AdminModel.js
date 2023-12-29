var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var AdminSchema = mongoose.Schema({
    full_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    user_type: {
        type: String,
        default: 'admin'
    },
    subscription_till: {
        type: Date,
        default: dateKolkata
    },
    subscription_plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subscriptions',
        default: null
    },
    created_date: {
        type: Date,
        default: dateKolkata
    },
    updated_date: {
        type: Date,
        default: dateKolkata
    },
    profile_image: {
        type: String,
        default: null
    },
    active: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('admins', AdminSchema);