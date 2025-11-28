const express = require('express');
const router = express.Router();
const ClassificationController = require('./classification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {

  // Categories Model
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
  listCategoriesSchema,
  
  // Categories Model
  createStatusSchema,
  updateStatusSchema,
  getStatusSchema,
  deleteStatusSchema,
  listStatusesSchema
} = require('./classification.validation');

/**
 * @swagger
 * tags:
 *   name: Classification
 *   description: Categories and Statuses builder management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Status:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         order:
 *           type: number
 *         color:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ============================================
// Categories ROUTES
// ============================================

/**
 * @swagger
 * /classification/categories:
 *   post:
 *     summary: Create a new Category (Admin only)
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/categories/', authenticate, authorize('ADMIN'), validate(createCategorySchema), ClassificationController.createCategory);

/**
 * @swagger
 * /classification/categories:
 *   get:
 *     summary: Get all Categories
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories/', authenticate, validate(listCategoriesSchema), ClassificationController.getAllCategories);

/**
 * @swagger
 * /classification/categories/{id}:
 *   get:
 *     summary: Get Category by ID
 *     tags: [Classification]
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
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/categories/:id', authenticate, validate(getCategorySchema), ClassificationController.getCategoryById);

/**
 * @swagger
 * /classification/categories/{id}:
 *   put:
 *     summary: Update Category (Admin only)
 *     tags: [Classification]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/categories/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), ClassificationController.updateCategory);

/**
 * @swagger
 * /classification/categories/{id}:
 *   delete:
 *     summary: Delete Category (Admin only)
 *     tags: [Classification]
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
 *         description: Category deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/categories/:id', authenticate, authorize('ADMIN'), validate(deleteCategorySchema), ClassificationController.deleteCategory);


// ============================================
// FORM STRUCTURE & VALIDATION ROUTES
// ============================================

/**
 * @swagger
 * /classification/statuses:
 *   post:
 *     summary: Create a new Status (Admin only)
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Status created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/statuses', authenticate, authorize('ADMIN'), validate(createStatusSchema), ClassificationController.createStatus);

/**
 * @swagger
 * /classification/statuses:
 *   get:
 *     summary: Get all Statuses
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statuses retrieved successfully
 */
router.get('/statuses', authenticate, validate(listStatusesSchema), ClassificationController.getAllStatuses);

/**
 * @swagger
 * /classification/statuses/{id}:
 *   get:
 *     summary: Get Status by ID
 *     tags: [Classification]
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
 *         description: Status retrieved successfully
 *       404:
 *         description: Status not found
 */
router.get('/statuses/:id', authenticate, validate(getStatusSchema), ClassificationController.getStatusById);

/**
 * @swagger
 * /classification/statuses/{id}:
 *   put:
 *     summary: Update status (Admin only)
 *     tags: [Classification]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/statuses/:id', authenticate, authorize('ADMIN'), validate(updateStatusSchema), ClassificationController.updateStatus);

/**
 * @swagger
 * /classification/statuses/{id}:
 *   delete:
 *     summary: Delete Status (Admin only)
 *     tags: [Classification]
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
 *         description: Status deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/statuses/:id', authenticate, authorize('ADMIN'), validate(deleteStatusSchema), ClassificationController.deleteStatus);

module.exports = router;
