const express = require('express');
const router = express.Router();
const {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
} = require('../controllers/tripController');
const { protect, admin } = require('../middleware/authMiddleware');
const identifyUser = require('../middleware/identifyUser');

// ...

router.route('/')
    .get(identifyUser, getTrips)
    .post(protect, createTrip);


/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip details by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip details
 */
router.route('/:id')
    .get(getTripById)
    .put(protect, updateTrip)
    .delete(protect, deleteTrip);

module.exports = router;
