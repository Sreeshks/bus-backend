const express = require('express');
const router = express.Router();
const {
    addLocation,
    getLocations,
    addFare,
    getFareQuery,
    deleteLocation,
    deleteFare,
} = require('../controllers/masterController');
const {
    getPayModes,
    addPayMode,
    updatePayMode,
    deletePayMode
} = require('../controllers/payModeController');
const {
    createRoute,
    getRoutes,
    getRoute,
    updateRoute,
    deleteRoute,
    calculateStopFares,
} = require('../controllers/routeController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const identifyUser = require('../middleware/identifyUser');



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
router.route('/locations')
    .get(identifyUser, getLocations)
    .post(protect, checkPermission('manage_locations'), addLocation);

router.route('/locations/:id')
    .delete(protect, checkPermission('manage_locations'), deleteLocation);

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
router.route('/fares')
    .get(identifyUser, getFareQuery)
    .post(protect, checkPermission('manage_locations'), addFare);

router.route('/fares/:id')
    .delete(protect, checkPermission('manage_locations'), deleteFare);

// Pay Modes
router.route('/pay-modes')
    .get(protect, getPayModes)
    .post(protect, checkPermission('manage_locations'), addPayMode);

router.route('/pay-modes/:id')
    .put(protect, checkPermission('manage_locations'), updatePayMode)
    .delete(protect, checkPermission('manage_locations'), deletePayMode);

// Routes
/**
 * @swagger
 * /api/master/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of routes with stops
 *   post:
 *     summary: Create a route (Admin)
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [source, destination, baseFare]
 *             properties:
 *               name:
 *                 type: string
 *               source:
 *                 type: string
 *               destination:
 *                 type: string
 *               stops:
 *                 type: array
 *               baseFare:
 *                 type: number
 *               totalDistance:
 *                 type: number
 *               estimatedDuration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Route created
 */
router.route('/routes')
    .get(protect, getRoutes)
    .post(protect, checkPermission('manage_locations'), createRoute);

router.route('/routes/calculate-fares')
    .post(protect, calculateStopFares);

router.route('/routes/:id')
    .get(protect, getRoute)
    .put(protect, checkPermission('manage_locations'), updateRoute)
    .delete(protect, checkPermission('manage_locations'), deleteRoute);

module.exports = router;
