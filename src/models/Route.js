const mongoose = require('mongoose');

const stopSchema = mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    distanceFromStart: {
        type: Number, // in km
        default: 0,
    },
    fare: {
        type: Number, // fare from source to this stop
        default: 0,
    },
    pricingMode: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto',
    },
    arrivalOffset: {
        type: Number, // minutes from departure
        default: 0,
    },
});

const routeSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    source: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    stops: [stopSchema],
    baseFare: {
        type: Number, // total fare source -> destination
        required: true,
    },
    totalDistance: {
        type: Number, // total km
        default: 0,
    },
    estimatedDuration: {
        type: Number, // total minutes
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Auto-generate route name if not provided
routeSchema.pre('save', function (next) {
    if (!this.name) {
        this.name = `${this.source} → ${this.destination}`;
    }
    next();
});

routeSchema.index({ source: 1, destination: 1, company: 1 });

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
