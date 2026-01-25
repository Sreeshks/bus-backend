const express = require('express');
const router = express.Router();
const {
    createBooking,
    getBookingById,
    getMyBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createBooking);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);

module.exports = router;
