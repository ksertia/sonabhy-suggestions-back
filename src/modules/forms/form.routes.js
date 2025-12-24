const express = require('express');
const router = express.Router();
const formController = require('./form.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createFormModelSchema,
  updateFormModelSchema,
  getFormModelSchema,
  deleteFormModelSchema,
  listFormModelsSchema,
  createFormVariantSchema,
  updateFormVariantSchema,
  getFormVariantSchema,
  deleteFormVariantSchema,
  listFormVariantsSchema,
  setDefaultVariantSchema,
  createFormFieldSchema,
  updateFormFieldSchema,
  getFormFieldSchema,
  deleteFormFieldSchema,
  listFormFieldsSchema,
  reorderFieldsSchema,
  bulkCreateFieldsSchema,
  bulkUpdateFieldsSchema,
  getFormStructureSchema,
  getDefaultFormStructureSchema,
  validateSubmissionSchema,
} = require('./form.validation');

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Dynamic form builder management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FormModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         type:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     FormVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         modelId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isDefault:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     FormField:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         variantId:
 *           type: string
 *           format: uuid
 *         label:
 *           type: string
 *         type:
 *           type: string
 *           enum: [TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, MULTISELECT, CHECKBOX, RADIO, FILE]
 *         required:
 *           type: boolean
 *         options:
 *           type: object
 *         placeholder:
 *           type: string
 *         helpText:
 *           type: string
 *         order:
 *           type: integer
 *         visibleFor:
 *           type: string
 *           enum: [ADMIN, MANAGER, USER]
 *         managedOnly:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ============================================
// FORM MODEL ROUTES
// ============================================

/**
 * @swagger
 * /forms/models:
 *   post:
 *     summary: Create a new form model (Admin only)
 *     tags: [Forms]
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
 *               type:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Form model created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/models', authenticate, authorize('ADMIN'), validate(createFormModelSchema), formController.createFormModel);

/**
 * @swagger
 * /forms/models:
 *   get:
 *     summary: Get all form models
 *     tags: [Forms]
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
router.get('/models', validate(listFormModelsSchema), formController.getAllFormModels);

/**
 * @swagger
 * /forms/models/{id}:
 *   get:
 *     summary: Get form model by ID
 *     tags: [Forms]
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
router.get('/models/:id', authenticate, validate(getFormModelSchema), formController.getFormModelById);

/**
 * @swagger
 * /forms/models/{id}:
 *   put:
 *     summary: Update form model (Admin only)
 *     tags: [Forms]
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
router.put('/models/:id', authenticate, authorize('ADMIN'), validate(updateFormModelSchema), formController.updateFormModel);

/**
 * @swagger
 * /forms/models/{id}/activate:
 *   patch:
 *     summary: activate form model (Admin/Manager only)
 *     tags: [Forms]
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
 *         description: form model activate set successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.patch('/models/:id/activate', authenticate, authorize('ADMIN', 'MANAGER'), validate(getFormModelSchema), formController.setActiveModel);

/**
 * @swagger
 * /forms/models/{id}:
 *   delete:
 *     summary: Delete form model (Admin only)
 *     tags: [Forms]
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
router.delete('/models/:id', authenticate, authorize('ADMIN'), validate(deleteFormModelSchema), formController.deleteFormModel);

// ============================================
// FORM VARIANT ROUTES
// ============================================

/**
 * @swagger
 * /forms/variants:
 *   post:
 *     summary: Create a new form variant (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *               - name
 *             properties:
 *               modelId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Form variant created successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.post('/variants', authenticate, authorize('ADMIN', 'MANAGER'), validate(createFormVariantSchema), formController.createFormVariant);

/**
 * @swagger
 * /forms/models/{modelId}/variants:
 *   get:
 *     summary: Get all variants for a form model
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Form variants retrieved successfully
 */
router.get('/models/:modelId/variants', validate(listFormVariantsSchema), formController.getAllFormVariants);

/**
 * @swagger
 * /forms/variants/{id}:
 *   get:
 *     summary: Get form variant by ID
 *     tags: [Forms]
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
 *         description: Form variant retrieved successfully
 *       404:
 *         description: Form variant not found
 */
router.get('/variants/:id', authenticate, validate(getFormVariantSchema), formController.getFormVariantById);

/**
 * @swagger
 * /forms/variants/{id}:
 *   put:
 *     summary: Update form variant (Admin/Manager only)
 *     tags: [Forms]
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
 *               isDefault:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Form variant updated successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.put('/variants/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateFormVariantSchema), formController.updateFormVariant);

/**
 * @swagger
 * /forms/variants/{id}:
 *   delete:
 *     summary: Delete form variant (Admin only)
 *     tags: [Forms]
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
 *         description: Form variant deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/variants/:id', authenticate, authorize('ADMIN'), validate(deleteFormVariantSchema), formController.deleteFormVariant);

/**
 * @swagger
 * /forms/models/{modelId}/variants/{variantId}/set-default:
 *   patch:
 *     summary: Set default variant for a model (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Default variant set successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.patch('/models/:modelId/variants/:variantId/set-default', authenticate, authorize('ADMIN', 'MANAGER'), validate(setDefaultVariantSchema), formController.setDefaultVariant);

// ============================================
// FORM FIELD ROUTES
// ============================================

/**
 * @swagger
 * /forms/fields:
 *   post:
 *     summary: Create a new form field (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variantId
 *               - label
 *               - type
 *             properties:
 *               variantId:
 *                 type: string
 *                 format: uuid
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, MULTISELECT, CHECKBOX, RADIO, FILE]
 *               visibleFor:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *               managedOnly:
 *                 type: boolean
 *                 default: false
 *               required:
 *                 type: boolean
 *                 default: false
 *               options:
 *                 type: object
 *                 description: JSON object with field-specific options (e.g., choices for SELECT)
 *               placeholder:
 *                 type: string
 *               helpText:
 *                 type: string
 *               order:
 *                 type: integer
 *           example:
 *             variantId: "uuid"
 *             label: "Project Category"
 *             type: "SELECT"
 *             required: true
 *             options:
 *               choices: ["Innovation", "Process Improvement", "Cost Reduction"]
 *             placeholder: "Select a category"
 *             helpText: "Choose the category that best fits your idea"
 *             order: 1
 *     responses:
 *       201:
 *         description: Form field created successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.post('/fields', authenticate, authorize('ADMIN', 'MANAGER'), validate(createFormFieldSchema), formController.createFormField);

/**
 * @swagger
 * /forms/variants/{variantId}/fields:
 *   get:
 *     summary: Get all fields for a form variant
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Form fields retrieved successfully
 */
router.get('/variants/:variantId/fields', validate(listFormFieldsSchema), formController.getAllFormFields);

/**
 * @swagger
 * /forms/fields/{id}:
 *   get:
 *     summary: Get form field by ID
 *     tags: [Forms]
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
 *         description: Form field retrieved successfully
 *       404:
 *         description: Form field not found
 */
router.get('/fields/:id', authenticate, validate(getFormFieldSchema), formController.getFormFieldById);

/**
 * @swagger
 * /forms/fields/{id}:
 *   put:
 *     summary: Update form field (Admin/Manager only)
 *     tags: [Forms]
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
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, MULTISELECT, CHECKBOX, RADIO, FILE]
 *               required:
 *                 type: boolean
 *               options:
 *                 type: object
 *               placeholder:
 *                 type: string
 *               helpText:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Form field updated successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.put('/fields/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateFormFieldSchema), formController.updateFormField);

/**
 * @swagger
 * /forms/fields/{id}:
 *   delete:
 *     summary: Delete form field (Admin/Manager only)
 *     tags: [Forms]
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
 *         description: Form field deleted successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.delete('/fields/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(deleteFormFieldSchema), formController.deleteFormField);

/**
 * @swagger
 * /forms/variants/{variantId}/fields/reorder:
 *   post:
 *     summary: Reorder form fields (drag & drop support) (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               - fieldOrders
 *             properties:
 *               fieldOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     order:
 *                       type: integer
 *           example:
 *             fieldOrders:
 *               - id: "field-uuid-1"
 *                 order: 1
 *               - id: "field-uuid-2"
 *                 order: 2
 *               - id: "field-uuid-3"
 *                 order: 3
 *     responses:
 *       200:
 *         description: Fields reordered successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.post('/variants/:variantId/fields/reorder', authenticate, authorize('ADMIN', 'MANAGER'), validate(reorderFieldsSchema), formController.reorderFields);

/**
 * @swagger
 * /forms/variants/{variantId}/fields/bulk:
 *   post:
 *     summary: Bulk create form fields (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               - fields
 *             properties:
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, MULTISELECT, CHECKBOX, RADIO, FILE]
 *                     visibleFor:
 *                       type: string
 *                       enum: [ADMIN, MANAGER, USER]
 *                     managedOnly:
 *                       type: boolean
 *                       default: false
 *                     required:
 *                       type: boolean
 *                     options:
 *                       type: object
 *                     placeholder:
 *                       type: string
 *                     helpText:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Fields created successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.post('/variants/:variantId/fields/bulk', authenticate, authorize('ADMIN', 'MANAGER'), validate(bulkCreateFieldsSchema), formController.bulkCreateFields);

/**
 * @swagger
 * /forms/variants/{variantId}/fields/bulk:
 *   put:
 *     summary: Bulk update form fields (Admin/Manager only)
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               - fields
 *             properties:
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the field to update
 *                     label:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [TEXT, TEXTAREA, NUMBER, EMAIL, DATE, SELECT, MULTISELECT, CHECKBOX, RADIO, FILE]
 *                     visibleFor:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [ADMIN, MANAGER, USER]
 *                     managedOnly:
 *                       type: boolean
 *                     required:
 *                       type: boolean
 *                     options:
 *                       type: object
 *                     placeholder:
 *                       type: string
 *                     helpText:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Fields updated successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 *       404:
 *         description: Form variant not found
 */
router.put(
  '/variants/:variantId/fields/bulk',authenticate, authorize('ADMIN', 'MANAGER'), validate(bulkUpdateFieldsSchema), formController.bulkUpdateFields
);


// ============================================
// FORM STRUCTURE & VALIDATION ROUTES
// ============================================

/**
 * @swagger
 * /forms/structure/{variantId}:
 *   get:
 *     summary: Get complete form structure by variant ID
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Form structure retrieved successfully
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
 *                     structure:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         model:
 *                           type: object
 *                         fields:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/FormField'
 *       404:
 *         description: Form variant not found
 */
router.get('/structure/:variantId', validate(getFormStructureSchema), formController.getFormStructure);

/**
 * @swagger
 * /forms/structure/default/{modelId}:
 *   get:
 *     summary: Get default form structure by model ID
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Default form structure retrieved successfully
 *       404:
 *         description: No default variant found
 */
router.get('/structure/default/:modelId', validate(getDefaultFormStructureSchema), formController.getDefaultFormStructure);

/**
 * @swagger
 * /forms/validate/{variantId}:
 *   post:
 *     summary: Validate user submission against form structure
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               - submission
 *             properties:
 *               submission:
 *                 type: object
 *                 description: Key-value pairs where keys are field labels or IDs
 *           example:
 *             submission:
 *               "Idea Title": "My great idea"
 *               "Description": "This is a detailed description"
 *               "Category": "Innovation"
 *               "Priority": "HIGH"
 *     responses:
 *       200:
 *         description: Validation result
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
 *                     valid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           fieldId:
 *                             type: string
 *                           message:
 *                             type: string
 *                     data:
 *                       type: object
 *                       description: Validated and normalized data
 */
router.post('/validate/:variantId', validate(validateSubmissionSchema), formController.validateSubmission);

module.exports = router;
