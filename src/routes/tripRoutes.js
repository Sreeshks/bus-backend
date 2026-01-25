const express = require('express');
const router = express.Router();
const {
    getTrips,
    getTripById,
    createTrip,
} = require('../controllers/tripController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// ...

router.route('/').get(getTrips).post(protect, checkPermission('manage_trips'), createTrip);


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
router.route('/:id').get(getTripById);

module.exports = router;
