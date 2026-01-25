const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    }
}, {
    timestamps: true,
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
