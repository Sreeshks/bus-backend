const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    }
}, {
    timestamps: true,
});

// Ensure name is unique per company
locationSchema.index({ name: 1, company: 1 }, { unique: true });
// Ensure code is unique per company (if used)
locationSchema.index({ code: 1, company: 1 }, { unique: true, partialFilterExpression: { code: { $type: "string" } } });


const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
