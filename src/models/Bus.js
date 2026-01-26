const mongoose = require('mongoose');

const busSchema = mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        required: true,
        // unique: true // Removed global unique
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
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});

const Bus = mongoose.model('Bus', busSchema);

// Ensure busNumber is unique per company
busSchema.index({ busNumber: 1, company: 1 }, { unique: true });

module.exports = Bus;
