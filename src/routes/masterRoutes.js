const express = require('express');
const router = express.Router();
const {
    addLocation,
    getLocations,
    addFare,
    getFareQuery
} = require('../controllers/masterController');
const { protect, admin } = require('../middleware/authMiddleware');

// Locations
/**
 * @swagger
 * tags:
 *   name: Master Data
 *   description: Locations and Fares management
 */

/**
 * @swagger
 * /api/master/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Master Data]
 *     responses:
 *       200:
 *         description: List of locations
 *   post:
 *     summary: Add a location (Admin)
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location added
 */
router.route('/locations').get(getLocations).post(protect, admin, addLocation);

// Fares
/**
 * @swagger
 * /api/master/fares:
 *   get:
 *     summary: Get fare between two points
 *     tags: [Master Data]
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fare details
 *   post:
 *     summary: Set fare (Admin)
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [source, destination, amount]
 *             properties:
 *               source:
 *                 type: string
 *               destination:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Fare set
 */
router.route('/fares').get(getFareQuery).post(protect, admin, addFare);

module.exports = router;
