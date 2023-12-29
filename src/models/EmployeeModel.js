var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var EmployeeSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        default: null
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'departments',
        default: null
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shifts',
        default: null
    },
    mobile: {
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
    designation: {
        type: String,
        default: ''
    },
    photos: [{
        file: {
            type: String,
            default: ''
        }
    }],
    created_date: {
        type: Date,
        default: dateKolkata
    },
    updated_date: {
        type: Date,
        default: dateKolkata
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

module.exports = mongoose.model('employees', EmployeeSchema);