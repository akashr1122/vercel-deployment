var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var DepartmentSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
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
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('departments', DepartmentSchema);