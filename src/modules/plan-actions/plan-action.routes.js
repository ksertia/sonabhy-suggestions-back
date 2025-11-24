const express = require('express');
const router = express.Router();
const planActionController = require('./plan-action.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createPlanActionSchema,
  updatePlanActionSchema,
  getPlanActionSchema,
  deletePlanActionSchema,
  listPlanActionsSchema,
  getPlanActionsByIdeaSchema,
  updateProgressSchema,
  assignUserSchema,
  getStatsByIdeaSchema,
} = require('./plan-action.validation');

/**
 * @swagger
 * tags:
 *   name: Plan Actions
 *   description: Plan action and task management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PlanAction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ideaId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         deadline:
 *           type: string
 *           format: date-time
 *         assignedTo:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         idea:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *             status:
 *               type: object
 *         assignee:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *             role:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/plan-actions:
 *   post:
 *     summary: Create a new plan action (Manager/Admin only)
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ideaId
 *               - title
 *             properties:
 *               ideaId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *           example:
 *             ideaId: "uuid"
 *             title: "Research AI chatbot solutions"
 *             description: "Evaluate different AI chatbot providers and compare features"
 *             progress: 0
 *             deadline: "2024-03-31T00:00:00.000Z"
 *             assignedTo: "user-uuid"
 *     responses:
 *       201:
 *         description: Plan action created successfully
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
 *                     planAction:
 *                       $ref: '#/components/schemas/PlanAction'
 *       403:
 *         description: Forbidden - Manager/Admin only
 */
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(createPlanActionSchema), planActionController.createPlanAction);

/**
 * @swagger
 * /api/v1/plan-actions:
 *   get:
 *     summary: Get all plan actions with filtering
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: ideaId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: progressMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: progressMax
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, in_progress, not_started]
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: string
 *       - in: query
 *         name: deadlineStart
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: deadlineEnd
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan actions retrieved successfully
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
 *                     planActions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PlanAction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/', authenticate, validate(listPlanActionsSchema), planActionController.getAllPlanActions);

/**
 * @swagger
 * /api/v1/plan-actions/my-actions:
 *   get:
 *     summary: Get plan actions assigned to me
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Your plan actions retrieved successfully
 */
router.get('/my-actions', authenticate, planActionController.getMyPlanActions);

/**
 * @swagger
 * /api/v1/plan-actions/my-stats:
 *   get:
 *     summary: Get my plan action statistics
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Your statistics retrieved successfully
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
 */
router.get('/my-stats', authenticate, planActionController.getMyStats);

/**
 * @swagger
 * /api/v1/plan-actions/stats/overall:
 *   get:
 *     summary: Get overall plan action statistics (Manager/Admin only)
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics retrieved successfully
 *       403:
 *         description: Forbidden - Manager/Admin only
 */
router.get('/stats/overall', authenticate, authorize('ADMIN', 'MANAGER'), planActionController.getOverallStats);

/**
 * @swagger
 * /api/v1/plan-actions/idea/{ideaId}:
 *   get:
 *     summary: Get all plan actions for an idea
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ideaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan actions retrieved successfully
 */
router.get('/idea/:ideaId', authenticate, validate(getPlanActionsByIdeaSchema), planActionController.getPlanActionsByIdea);

/**
 * @swagger
 * /api/v1/plan-actions/idea/{ideaId}/stats:
 *   get:
 *     summary: Get plan action statistics for an idea
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ideaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 */
router.get('/idea/:ideaId/stats', authenticate, validate(getStatsByIdeaSchema), planActionController.getStatsByIdea);

/**
 * @swagger
 * /api/v1/plan-actions/{id}:
 *   get:
 *     summary: Get plan action by ID
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan action retrieved successfully
 *       404:
 *         description: Plan action not found
 */
router.get('/:id', authenticate, validate(getPlanActionSchema), planActionController.getPlanActionById);

/**
 * @swagger
 * /api/v1/plan-actions/{id}:
 *   put:
 *     summary: Update plan action
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Plan action updated successfully
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, validate(updatePlanActionSchema), planActionController.updatePlanAction);

/**
 * @swagger
 * /api/v1/plan-actions/{id}/progress:
 *   patch:
 *     summary: Update plan action progress (0-100%)
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *           example:
 *             progress: 75
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch('/:id/progress', authenticate, validate(updateProgressSchema), planActionController.updateProgress);

/**
 * @swagger
 * /api/v1/plan-actions/{id}/assign:
 *   patch:
 *     summary: Assign user to plan action (Manager/Admin only)
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *           example:
 *             userId: "user-uuid"
 *     responses:
 *       200:
 *         description: User assigned successfully
 *       403:
 *         description: Forbidden - Manager/Admin only
 */
router.patch('/:id/assign', authenticate, authorize('ADMIN', 'MANAGER'), validate(assignUserSchema), planActionController.assignUser);

/**
 * @swagger
 * /api/v1/plan-actions/{id}:
 *   delete:
 *     summary: Delete plan action (Manager/Admin only)
 *     tags: [Plan Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan action deleted successfully
 *       403:
 *         description: Forbidden - Manager/Admin only
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(deletePlanActionSchema), planActionController.deletePlanAction);

module.exports = router;
