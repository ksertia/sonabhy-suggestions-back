const express = require('express');
const router = express.Router();
const tacheController = require('./tache.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createTacheSchema,
  createMultipleTachesSchema,
  updateTacheSchema,
  updateProgressSchema,
  addCommentSchema,
} = require('./tache.validation');

/**
 * @swagger
 * tags:
 *   name: Taches
 *   description: Task management under plan actions
 * 
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Tache:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         planActionId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, DONE]   # adapte selon ton enum réel
 *         deadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *         # Relations
 *         planAction:
 *           $ref: '#/components/schemas/PlanAction'
 *
 *         assignee:
 *           $ref: '#/components/schemas/User'
 *
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *
 *
 *     CreateTache:
 *       type: object
 *       required:
 *         - planActionId
 *         - title
 *       properties:
 *         planActionId:
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
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELED]
 *         deadline:
 *           type: string
 *           format: date-time
 *         assignedTo:
 *           type: string
 *           format: uuid
 * 
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         tacheId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 */


/**
 * @swagger
 * /taches:
 *   post:
 *     summary: Create a new tache (Manager/Admin only)
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTache'
 *     responses:
 *       201:
 *         description: Tache created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tache'
 */
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(createTacheSchema), tacheController.createTache);

/**
 * @swagger
 * /taches/bulk/{planActionId}:
 *   post:
 *     summary: Create multiple taches under a plan action (Manager/Admin only)
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planActionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateTache'
 *     responses:
 *       201:
 *         description: Multiple taches created successfully
 */
router.post('/bulk/:planActionId', authenticate, authorize('ADMIN', 'MANAGER'), validate(createMultipleTachesSchema), tacheController.createMultipleTaches);

/**
 * @swagger
 * /taches/{id}:
 *   get:
 *     summary: Get tache by ID
 *     tags: [Taches]
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
 *         description: Tache retrieved successfully
 */
router.get('/:id', authenticate, tacheController.getTacheById);

/**
 * @swagger
 * /taches/plan-action/{planActionId}:
 *   get:
 *     summary: Get all taches under a plan action
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planActionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Taches retrieved successfully
 */
router.get('/plan-action/:planActionId', authenticate, tacheController.getTachesByPlanAction);

/**
 * @swagger
 * /taches/{id}:
 *   patch:
 *     summary: Update a tache
 *     tags: [Taches]
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
 *             $ref: '#/components/schemas/CreateTache'
 *     responses:
 *       200:
 *         description: Tache updated successfully
 */
router.patch('/:id', authenticate, validate(updateTacheSchema), tacheController.updateTache);

/**
 * @swagger
 * /taches/{id}/progress:
 *   patch:
 *     summary: Update tache progress
 *     tags: [Taches]
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
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch('/:id/progress', authenticate, validate(updateProgressSchema), tacheController.updateProgress);

/**
 * @swagger
 * /taches/{id}/assign/{userId}:
 *   patch:
 *     summary: assign user to task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Taches retrieved successfully
 */
router.patch('/:id/assign/:userId', authenticate, tacheController.assignUser);

/**
 * @swagger
 * /taches/{id}/status/{status}:
 *   patch:
 *     summary: assign user to task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Taches retrieved successfully
 */
router.patch('/:id/status/:status', authenticate, tacheController.changeStatus);

/**
 * @swagger
 * /taches/{id}/complete:
 *   patch:
 *     summary: assign user to task
 *     tags: [Taches]
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
 *         description: Taches retrieved successfully
 */
router.patch("/:id/complete", authenticate, tacheController.completeTache);

/**
 * @swagger
 * /taches/{id}:
 *   delete:
 *     summary: delete tache
 *     tags: [Taches]
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
 *         description: Taches retrieved successfully
 */
router.delete('/:id', authenticate, tacheController.deleteTache);


/**
 * @swagger
 * /taches/{id}/comments:
 *   post:
 *     summary: Add a comment to an tache (Manager/Admin only)
 *     tags: [Taches]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                     comment:
 *                       $ref: '#/components/schemas/Comment'
 */
router.post('/:id/comments', authenticate, validate(addCommentSchema), tacheController.addComment);

/**
 * @swagger
 * /taches/{id}/comments:
 *   get:
 *     summary: Get all comments for an tache
 *     tags: [Taches]
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
 *         description: Comments retrieved successfully
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
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 */
router.get('/:id/comments', authenticate, tacheController.getComments);

module.exports = router;
