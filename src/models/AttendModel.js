var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var AttendSchema = mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        default: null
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins',
        default: null
    },
    position: {
        type:{
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0,0]
        }
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
    }
});

module.exports = mongoose.model('attends', AttendSchema);