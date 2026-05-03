const mongoose = require('mongoose');

const payModeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String, // Icon name/identifier for the mobile app
        default: 'payments',
    },
    color: {
        type: String, // Hex color for UI display
        default: '#D4952A',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

payModeSchema.index({ company: 1, sortOrder: 1 });

const PayMode = mongoose.model('PayMode', payModeSchema);

module.exports = PayMode;
