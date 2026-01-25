const mongoose = require('mongoose');

const busSchema = mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'Semi-Sleeper'],
        default: 'Non-AC'
    },
    capacity: {
        type: Number,
        required: true,
    },
    operatorName: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
