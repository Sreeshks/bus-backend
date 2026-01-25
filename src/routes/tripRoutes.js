const express = require('express');
const router = express.Router();
const {
    getTrips,
    getTripById,
    createTrip,
} = require('../controllers/tripController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip/Schedule management
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Search trips
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source location
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Destination location
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date of travel (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of matching trips
 *   post:
 *     summary: Create a trip (Admin)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busId
 *               - source
 *               - destination
 *               - departureTime
 *               - arrivalTime
 *               - fare
 *               - seatsAvailable
 *             properties:
 *               busId:
 *                 type: string
 *               source:
 *                 type: string
 *               destination:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *               fare:
 *                 type: number
 *               seatsAvailable:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Trip created
 */
router.route('/').get(getTrips).post(protect, admin, createTrip);

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
