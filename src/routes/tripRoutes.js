const express = require('express');
const router = express.Router();
const {
    getTrips,
    getTripById,
    createTrip,
} = require('../controllers/tripController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getTrips).post(protect, admin, createTrip);
router.route('/:id').get(getTripById);

module.exports = router;
