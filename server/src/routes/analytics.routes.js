const express = require('express');
const {
  getOverview,
  getCategoryBreakdown,
  getTrends
} = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard metrics and visualizations
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get high-level monthly/yearly spending totals
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Optional User ID to filter by (Admin only)
 *     responses:
 *       200:
 *         description: Overview data including total income, total expense, and net balance
 */
router.get('/overview', getOverview);

/**
 * @swagger
 * /api/analytics/category:
 *   get:
 *     summary: Get expense breakdown by category for pie charts
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Optional User ID to filter by (Admin only)
 *     responses:
 *       200:
 *         description: Object mapping categories to total expense amounts
 */
router.get('/category', getCategoryBreakdown);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get income vs expense historical trends for line/bar charts
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Optional User ID to filter by (Admin only)
 *     responses:
 *       200:
 *         description: Object mapping month-year to income and expense totals
 */
router.get('/trends', getTrends);

module.exports = router;
