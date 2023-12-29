var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var ShiftSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        default: null
    },
    from: {
        type: String,
        default: ''
    },
    to: {
        type: String,
        default: ''
    },
    created_date: {
        type: Date,
        default: dateKolkata
    },
    updated_date: {
        type: Date,
        default: dateKolkata
    },
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('shifts', ShiftSchema);