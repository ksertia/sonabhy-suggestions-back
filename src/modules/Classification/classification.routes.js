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
 * /api/v1/classification/categories:
 *   post:
 *     summary: Create a new form model (Admin only)
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
 *         description: Form model created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/categories/', authenticate, authorize('ADMIN'), validate(createCategorySchema), ClassificationController.createCategory);

/**
 * @swagger
 * /api/v1/classification/categories:
 *   get:
 *     summary: Get all form models
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form models retrieved successfully
 */
router.get('/categories/', authenticate, validate(listCategoriesSchema), ClassificationController.getAllCategories);

/**
 * @swagger
 * /api/v1/classification/categories/{id}:
 *   get:
 *     summary: Get form model by ID
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
 *         description: Form model retrieved successfully
 *       404:
 *         description: Form model not found
 */
router.get('/categories/:id', authenticate, validate(getCategorySchema), ClassificationController.getCategoryById);

/**
 * @swagger
 * /api/v1/classification/categories/{id}:
 *   put:
 *     summary: Update form model (Admin only)
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Form model updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/categories/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), ClassificationController.updateCategory);

/**
 * @swagger
 * /api/v1/classification/categories/{id}:
 *   delete:
 *     summary: Delete form model (Admin only)
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
 *         description: Form model deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/categories/:id', authenticate, authorize('ADMIN'), validate(deleteCategorySchema), ClassificationController.deleteCategory);


// ============================================
// FORM STRUCTURE & VALIDATION ROUTES
// ============================================

module.exports = router;
