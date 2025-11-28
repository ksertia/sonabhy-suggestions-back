const express = require('express');
const router = express.Router();
const ideaController = require('./idea.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { upload } = require('../../middleware/upload.middleware');
const {
  createIdeaSchema,
  updateIdeaSchema,
  getIdeaSchema,
  deleteIdeaSchema,
  listIdeasSchema,
  updateStatusSchema,
  addCommentSchema,
  createPlanActionSchema,
  uploadFilesSchema,
} = require('./idea.validation');

/**
 * @swagger
 * tags:
 *   name: Ideas
 *   description: Idea management and workflow
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Idea:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         data:
 *           type: json
 *         isAnonymous:
 *           type: boolean
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         formVariantId:
 *           type: string
 *           format: uuid
 *         metadataId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ideaId:
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
 *     
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
 */

/**
 * @swagger
 * /ideas:
 *   post:
 *     summary: Create a new idea
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - formVariantId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               data:
 *                 type: json
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *               formVariantId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Idea created successfully
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
 *                     idea:
 *                       $ref: '#/components/schemas/Idea'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createIdeaSchema), ideaController.createIdea);

/**
 * @swagger
 * /ideas:
 *   get:
 *     summary: Get all ideas with filtering and pagination
 *     tags: [Ideas]
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
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *       - in: query
 *         name: impact
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, VERY_HIGH]
 *       - in: query
 *         name: formVariantId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isAnonymous
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Ideas retrieved successfully
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
 *                     ideas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Idea'
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
router.get('/', authenticate, validate(listIdeasSchema), ideaController.getAllIdeas);

/**
 * @swagger
 * /ideas/stats:
 *   get:
 *     summary: Get idea statistics
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', authenticate, ideaController.getStats);

/**
 * @swagger
 * /ideas/{id}:
 *   get:
 *     summary: Get idea by ID
 *     tags: [Ideas]
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
 *         description: Idea retrieved successfully
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
 *                     idea:
 *                       $ref: '#/components/schemas/Idea'
 *       404:
 *         description: Idea not found
 */
router.get('/:id', authenticate, validate(getIdeaSchema), ideaController.getIdeaById);

/**
 * @swagger
 * /ideas/{id}:
 *   put:
 *     summary: Update an idea
 *     tags: [Ideas]
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
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               urgency:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               impact:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, VERY_HIGH]
 *     responses:
 *       200:
 *         description: Idea updated successfully
 *       404:
 *         description: Idea not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticate, validate(updateIdeaSchema), ideaController.updateIdea);

/**
 * @swagger
 * /ideas/{id}:
 *   delete:
 *     summary: Delete an idea
 *     tags: [Ideas]
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
 *         description: Idea deleted successfully
 *       404:
 *         description: Idea not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticate, validate(deleteIdeaSchema), ideaController.deleteIdea);

/**
 * @swagger
 * /ideas/{id}/status:
 *   patch:
 *     summary: Update idea status (Manager/Admin only)
 *     tags: [Ideas]
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
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Forbidden - Managers/Admins only
 */
router.patch('/:id/status', authenticate, validate(updateStatusSchema), ideaController.updateStatus);

/**
 * @swagger
 * /ideas/{id}/files:
 *   post:
 *     summary: Upload files to an idea (single or multiple)
 *     tags: [Ideas]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files provided
 */
router.post(
  '/:id/files',
  authenticate,
  validate(uploadFilesSchema),
  upload.array('files', 10),
  ideaController.uploadFiles
);

/**
 * @swagger
 * /ideas/{id}/comments:
 *   post:
 *     summary: Add a comment to an idea (Manager/Admin only)
 *     tags: [Ideas]
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
router.post('/:id/comments', authenticate, validate(addCommentSchema), ideaController.addComment);

/**
 * @swagger
 * /ideas/{id}/comments:
 *   get:
 *     summary: Get all comments for an idea
 *     tags: [Ideas]
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
router.get('/:id/comments', authenticate, validate(getIdeaSchema), ideaController.getComments);

/**
 * @swagger
 * /ideas/{id}/plan-actions:
 *   post:
 *     summary: Create a plan action from an idea (Manager/Admin only)
 *     tags: [Ideas]
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
 *               - title
 *             properties:
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
 *         description: Forbidden - Managers/Admins only
 */
router.post('/:id/plan-actions', authenticate, validate(createPlanActionSchema), ideaController.createPlanAction);

/**
 * @swagger
 * /ideas/{id}/plan-actions:
 *   get:
 *     summary: Get all plan actions for an idea
 *     tags: [Ideas]
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
 */
router.get('/:id/plan-actions', authenticate, validate(getIdeaSchema), ideaController.getPlanActions);


/**
 * @swagger
 * /ideas/{ideaId}/score:
 *   get:
 *     summary: Get score for an idea
 *     tags: [Ideas]
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
 *         description: Score retrieved successfully
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
 *                     score:
 *                       type: number
 */
router.get('/:ideaId/score', authenticate, validate(getIdeaSchema), ideaController.score);

/**
 * @swagger
 * /ideas/{ideaId}/user/{userId}:
 *   post:
 *     summary: vote idea
 *     tags: [Ideas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: ideaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: vote added successfully
 */
router.post('/:ideaId/user/:userId', authenticate , validate(getIdeaSchema), ideaController.like);

module.exports = router;
