const { z } = require('zod');

// ============================================
// CATEGORIES SCHEMAS
// ============================================

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
  }),
});

const getCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const listCategoriesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});

// ============================================
// STATUSES SCHEMAS
// ============================================

const createStatusSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().optional(),
    order: z.number(),
    color: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    order: z.number(),
    color: z.string().optional(),
  }),
});

const getStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const deleteStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const listStatusesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});

module.exports = {
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
 
};
