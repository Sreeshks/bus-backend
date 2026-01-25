const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true,
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
    },
    conductor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The user (conductor) who issued the ticket
    },
    source: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    adultCount: {
        type: Number,
        default: 1,
    },
    childCount: {
        type: Number,
        default: 0,
    },
    farePerAdult: {
        type: Number,
        required: true,
    },
    farePerChild: {
        type: Number, // Usually half or full, depending on policy. We store what was charged.
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    ticketNumber: {
        type: String,
        required: true,
        unique: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
