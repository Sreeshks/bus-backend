const jwt = require('jsonwebtoken');
const User = require('../models/User');

const identifyUser = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Identification failed (token invalid or expired), continuing as guest:', error.message);
            // Do nothing, just continue as guest
        }
    }

    next();
};

module.exports = identifyUser;
