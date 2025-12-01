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
  assignUsersSchema,
} = require('./tache.validation');

/**
 * @swagger
 * tags:
 *   name: Taches
 *   description: Task management under plan actions
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
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createTacheSchema),
  tacheController.createTache
);

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
 *             $ref: '#/components/schemas/CreateMultipleTaches'
 *     responses:
 *       201:
 *         description: Multiple taches created successfully
 */
router.post(
  '/bulk/:planActionId',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createMultipleTachesSchema),
  tacheController.createMultipleTaches
);

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
 *             $ref: '#/components/schemas/UpdateTache'
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
 *             $ref: '#/components/schemas/UpdateProgress'
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch('/:id/progress', authenticate, validate(updateProgressSchema), tacheController.updateProgress);

/**
 * @swagger
 * /taches/{id}/assign:
 *   patch:
 *     summary: Assign multiple users to a tache
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
 *             $ref: '#/components/schemas/AssignUsers'
 *     responses:
 *       200:
 *         description: Users assigned successfully
 */
router.patch('/:id/assign', authenticate, validate(assignUsersSchema), tacheController.assignUsers);

module.exports = router;
