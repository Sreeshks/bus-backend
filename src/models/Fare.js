const mongoose = require('mongoose');

const fareSchema = mongoose.Schema({
    source: {
        type: String,
        required: true, // Location Name
    },
    destination: {
        type: String,
        required: true, // Location Name
    },
    amount: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

// Ensure unique combination of source and destination
fareSchema.index({ source: 1, destination: 1 }, { unique: true });

const Fare = mongoose.model('Fare', fareSchema);

module.exports = Fare;
