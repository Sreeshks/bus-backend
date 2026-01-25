const express = require('express');
const router = express.Router();
const { issueTicket, getTickets } = require('../controllers/ticketController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Conductor Billing/Ticketing
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get tickets issued by current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *   post:
 *     summary: Issue a new ticket (Billing)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [busId, source, destination, adultCount]
 *             properties:
 *               busId:
 *                 type: string
 *               tripId:
 *                 type: string
 *               source:
 *                 type: string
 *               destination:
 *                 type: string
 *               adultCount:
 *                 type: integer
 *               childCount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ticket issued with total amount
 */
router.route('/')
    .get(protect, getTickets)
    .post(protect, checkPermission('issue_tickets'), issueTicket);

module.exports = router;
