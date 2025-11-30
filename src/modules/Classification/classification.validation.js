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
// Kinds SCHEMAS
// ============================================

const createKindSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().optional(),
  }),
});

const updateKindSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
  }),
});

const getKindSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const deleteKindSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid form model ID'),
  }),
});

const listKindsSchema = z.object({
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
  createKindSchema,
  updateKindSchema,
  getKindSchema,
  deleteKindSchema,
  listKindsSchema
 
};
