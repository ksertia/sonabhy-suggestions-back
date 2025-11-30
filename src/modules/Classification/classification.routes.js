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
  createKindSchema,
  updateKindSchema,
  getKindSchema,
  deleteKindSchema,
  listKindsSchema
} = require('./classification.validation');

/**
 * @swagger
 * tags:
 *   name: Classification
 *   description: Categories and kinds builder management
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
// kinds STRUCTURE & VALIDATION ROUTES
// ============================================

/**
 * @swagger
 * /classification/kinds:
 *   post:
 *     summary: Create a new kind (Admin only)
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
 *         description: kind created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/kinds', authenticate, authorize('ADMIN'), validate(createKindSchema), ClassificationController.createKind);

/**
 * @swagger
 * /classification/kinds:
 *   get:
 *     summary: Get all kinds
 *     tags: [Classification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: kinds retrieved successfully
 */
router.get('/kinds', authenticate, validate(listKindsSchema), ClassificationController.getAllKinds);

/**
 * @swagger
 * /classification/kinds/{id}:
 *   get:
 *     summary: Get kind by ID
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
 *         description: kind retrieved successfully
 *       404:
 *         description: kind not found
 */
router.get('/kinds/:id', authenticate, validate(getKindSchema), ClassificationController.getKindById);

/**
 * @swagger
 * /classification/kinds/{id}:
 *   put:
 *     summary: Update kind (Admin only)
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
 *         description: kind updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/kinds/:id', authenticate, authorize('ADMIN'), validate(updateKindSchema), ClassificationController.updateKind);

/**
 * @swagger
 * /classification/kinds/{id}:
 *   delete:
 *     summary: Delete kind (Admin only)
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
 *         description: kind deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/kinds/:id', authenticate, authorize('ADMIN'), validate(deleteKindSchema), ClassificationController.deleteKind);

module.exports = router;
