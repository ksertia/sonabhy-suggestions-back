const { z } = require('zod');

// ============================================
// FORM MODEL SCHEMAS
// ============================================

const createFormModelSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().optional(),
    type: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateFormModelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const getFormModelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const deleteFormModelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const listFormModelsSchema = z.object({
  query: z.object({
    isActive: z.string().optional(),
    search: z.string().optional(),
  }),
});

// ============================================
// FORM VARIANT SCHEMAS
// ============================================

const createFormVariantSchema = z.object({
  body: z.object({
    modelId: z.string().uuid('Invalid model ID'),
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateFormVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form variant ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

const getFormVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form variant ID'),
  }),
});

const deleteFormVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form variant ID'),
  }),
});

const listFormVariantsSchema = z.object({
  params: z.object({
    modelId: z.string().uuid('Invalid model ID'),
  }),
});

const setDefaultVariantSchema = z.object({
  params: z.object({
    modelId: z.string().uuid('Invalid model ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
});

// ============================================
// FORM FIELD SCHEMAS
// ============================================

const createFormFieldSchema = z.object({
  body: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    label: z.string().min(1, 'Label is required').max(200),
    type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE']),
    required: z.boolean().optional().default(false),
    options: z.any().optional(), // JSON field
    visibleFor: z.enum(['MANAGER', 'ADMIN', 'USER']).optional(), 
    managedOnly: z.boolean().optional(), 
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    order: z.number().int().min(1).optional(),
  }),
});

const updateFormFieldSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form field ID'),
  }),
  body: z.object({
    label: z.string().min(1).max(200).optional(),
    type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE']).optional(),
    required: z.boolean().optional(),
    options: z.any().optional(),
    visibleFor: z.enum(['MANAGER', 'ADMIN', 'USER']).optional(), 
    managedOnly: z.boolean().optional(), 
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    order: z.number().int().min(1).optional(),
  }),
});

const getFormFieldSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form field ID'),
  }),
});

const deleteFormFieldSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form field ID'),
  }),
});

const listFormFieldsSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
});

const reorderFieldsSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: z.object({
    fieldOrders: z.array(
      z.object({
        id: z.string().uuid('Invalid field ID'),
        order: z.number().int().min(1),
      })
    ).min(1, 'At least one field order is required'),
  }),
});

const bulkCreateFieldsSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: z.object({
    fields: z.array(
      z.object({
        label: z.string().min(1).max(200),
        type: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE']),
        required: z.boolean().optional().default(false),
        options: z.any().optional(),
        visibleFor: z.enum(['ADMIN', 'USER', 'MANAGER']).optional(), 
        managedOnly: z.boolean().optional(), 
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        order: z.number().int().min(1),
      })
    ).min(1, 'At least one field is required'),
  }),
});

// ============================================
// FORM STRUCTURE & VALIDATION SCHEMAS
// ============================================

const getFormStructureSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
});

const getDefaultFormStructureSchema = z.object({
  params: z.object({
    modelId: z.string().uuid('Invalid model ID'),
  }),
});

const validateSubmissionSchema = z.object({
  params: z.object({
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: z.object({
    submission: z.record(z.any()),
  }),
});

module.exports = {
  // Form Model
  createFormModelSchema,
  updateFormModelSchema,
  getFormModelSchema,
  deleteFormModelSchema,
  listFormModelsSchema,
  
  // Form Variant
  createFormVariantSchema,
  updateFormVariantSchema,
  getFormVariantSchema,
  deleteFormVariantSchema,
  listFormVariantsSchema,
  setDefaultVariantSchema,
  
  // Form Field
  createFormFieldSchema,
  updateFormFieldSchema,
  getFormFieldSchema,
  deleteFormFieldSchema,
  listFormFieldsSchema,
  reorderFieldsSchema,
  bulkCreateFieldsSchema,
  
  // Form Structure & Validation
  getFormStructureSchema,
  getDefaultFormStructureSchema,
  validateSubmissionSchema,
};
