const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  getOverviewStatsSchema,
  getMonthlyTrendsSchema,
  getTopCategoriesSchema,
  getStatusDistributionSchema,
  getPlanActionsProgressSchema,
  getIdeasTransformedSchema,
  getRecentIdeasSchema,
} = require('./dashboard.validation');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and analytics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OverviewStats:
 *       type: object
 *       properties:
 *         totalIdeas:
 *           type: integer
 *         ideasByCategory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               color:
 *                 type: string
 *               count:
 *                 type: integer
 *         ideasByStatus:
 *           type: array
 *           items:
 *             type: object
 *         ideasWithActions:
 *           type: object
 *           properties:
 *             totalIdeas:
 *               type: integer
 *             ideasWithActions:
 *               type: integer
 *             percentage:
 *               type: integer
 *         planActionsProgress:
 *           type: object
 *         topCategories:
 *           type: array
 *           items:
 *             type: object
 *         statusDistribution:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get comprehensive overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: statusId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Overview statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/OverviewStats'
 */
router.get('/overview', authenticate, validate(getOverviewStatsSchema), dashboardController.getOverviewStats);

/**
 * @swagger
 * /dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly trends for ideas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to retrieve (default 12)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: statusId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Monthly trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-01"
 *                           count:
 *                             type: integer
 *                             example: 15
 */
router.get('/monthly-trends', authenticate, validate(getMonthlyTrendsSchema), dashboardController.getMonthlyTrends);

/**
 * @swagger
 * /dashboard/top-categories:
 *   get:
 *     summary: Get top categories by idea count
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Top categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           color:
 *                             type: string
 *                           ideaCount:
 *                             type: integer
 */
router.get('/top-categories', authenticate, validate(getTopCategoriesSchema), dashboardController.getTopCategories);

/**
 * @swagger
 * /dashboard/status-distribution:
 *   get:
 *     summary: Get status distribution with percentages
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Status distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     distribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           color:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           percentage:
 *                             type: integer
 */
router.get('/status-distribution', authenticate, validate(getStatusDistributionSchema), dashboardController.getStatusDistribution);

/**
 * @swagger
 * /dashboard/plan-actions-progress:
 *   get:
 *     summary: Get plan actions progress summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: ideaId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan actions progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                         notStarted:
 *                           type: integer
 *                         overdue:
 *                           type: integer
 *                         avgProgress:
 *                           type: integer
 *                         completionRate:
 *                           type: integer
 */
router.get('/plan-actions-progress', authenticate, validate(getPlanActionsProgressSchema), dashboardController.getPlanActionsProgress);

/**
 * @swagger
 * /dashboard/ideas-transformed:
 *   get:
 *     summary: Get percentage of ideas transformed into actions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: statusId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Ideas transformation percentage retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIdeas:
 *                       type: integer
 *                     ideasWithActions:
 *                       type: integer
 *                     percentage:
 *                       type: integer
 */
router.get('/ideas-transformed', authenticate, validate(getIdeasTransformedSchema), dashboardController.getIdeasTransformedPercentage);

/**
 * @swagger
 * /dashboard/recent-ideas:
 *   get:
 *     summary: Get recent ideas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: statusId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recent ideas retrieved successfully
 */
router.get('/recent-ideas', authenticate, validate(getRecentIdeasSchema), dashboardController.getRecentIdeas);

/**
 * @swagger
 * /dashboard/user:
 *   get:
 *     summary: Get user-specific dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                         recentIdeas:
 *                           type: array
 *                         planActionsProgress:
 *                           type: object
 *                         monthlyTrends:
 *                           type: array
 */
router.get('/user', authenticate, dashboardController.getUserDashboard);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard with system-wide statistics (Manager/Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         overallStats:
 *                           type: object
 *                         overviewStats:
 *                           type: object
 *                         monthlyTrends:
 *                           type: array
 *                         topCategories:
 *                           type: array
 *                         ideasByRole:
 *                           type: array
 *                         recentIdeas:
 *                           type: array
 *       403:
 *         description: Forbidden - Manager/Admin only
 */
router.get('/admin', authenticate, authorize('ADMIN', 'MANAGER'), dashboardController.getAdminDashboard);

/**
 * @swagger
 * /dashboard/home:
 *   get:
 *     summary: Get home dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard loaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     usersCount:
 *                       type: integer
 *                       example: 154
 *                     ideaCount:
 *                       type: integer
 *                       example: 432
 *                     ideaValideCount:
 *                       type: integer
 *                       example: 128
 */
router.get('/home', authenticate, dashboardController.getCountHome);


module.exports = router;
