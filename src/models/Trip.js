const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    departureTime: {
        type: Date,
        required: true,
    },
    arrivalTime: {
        type: Date,
        required: true,
    },
    fare: {
        type: Number,
        required: true,
    },
    seatsAvailable: {
        type: Number,
        required: true,
    },
    stops: [{
        location: String,
        time: Date
    }]
}, {
    timestamps: true,
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
