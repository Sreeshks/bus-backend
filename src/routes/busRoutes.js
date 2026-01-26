const express = require('express');
const router = express.Router();
const {
    getBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
} = require('../controllers/busController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const identifyUser = require('../middleware/identifyUser');

/**
 * @swagger
 * tags:
 *   name: Buses
 *   description: Bus management
 */

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
 *     responses:
 *       200:
 *         description: List of buses
 *   post:
 *     summary: Create a new bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busNumber
 *               - name
 *               - capacity
 *               - operatorName
 *             properties:
 *               busNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [AC, Non-AC, Sleeper, Seater, Semi-Sleeper]
 *               capacity:
 *                 type: integer
 *               operatorName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bus created
 */
router.route('/')
    .get(identifyUser, getBuses)
    .post(protect, checkPermission('manage_buses'), createBus);

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: Get bus by ID
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bus details
 *   put:
 *     summary: Update bus details
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bus updated
 *   delete:
 *     summary: Delete a bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bus deleted
 */
router.route('/:id')
    .get(getBusById)
    .put(protect, checkPermission('manage_buses'), updateBus)
    .delete(protect, checkPermission('manage_buses'), deleteBus);

module.exports = router;
