const express = require('express');
const router = express.Router();
const { getDailyReport, getDashboardStats } = require('../controllers/reportController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and Reporting
 */

/**
 * @swagger
 * /api/reports/daily:
 *   get:
 *     summary: Get daily collection report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Report data
 */
router.get('/daily', protect, checkPermission('view_reports'), getDailyReport);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/dashboard', protect, checkPermission('view_reports'), getDashboardStats);

module.exports = router;
