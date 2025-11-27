const { z } = require('zod');

// Create Idea Schema
const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.string().uuid('Invalid category ID'),
    statusId: z.string().uuid('Invalid status ID').optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional().default('MEDIUM'),
    isAnonymous: z.boolean().optional().default(false),
    formVariantId: z.string().uuid('Invalid form variant ID'),
  }),
});

// Update Idea Schema
const updateIdeaSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).optional(),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
    formVariantId: z.string().uuid().optional(),
  }),
});

// Get Idea by ID Schema
const getIdeaSchema = z.object({
  params: z.object({
    id: z.string().uuid().optional(),
    ideaId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
  })
}).refine(
  (data) => data.params.id || data.params.ideaId || data.params.userId,
  {
    message: "You must provide either id, ideaId, or userId",
    path: ["params"],
  }
);

// Delete Idea Schema
const deleteIdeaSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
});

// List Ideas Schema (Query Filters)
const listIdeasSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
    formVariantId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    isAnonymous: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Update Status Schema
const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
  body: z.object({
    statusId: z.string().uuid('Invalid status ID'),
  }),
});

// Add Comment Schema
const addCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(2000, 'Comment must not exceed 2000 characters'),
  }),
});

// Create Plan Action Schema
const createPlanActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().optional(),
    progress: z.number().min(0).max(100).optional().default(0),
    deadline: z.string().datetime().optional(),
    assignedTo: z.string().uuid('Invalid user ID').optional(),
  }),
});

// Upload Files Schema
const uploadFilesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid idea ID'),
  }),
});

module.exports = {
  createIdeaSchema,
  updateIdeaSchema,
  getIdeaSchema,
  deleteIdeaSchema,
  listIdeasSchema,
  updateStatusSchema,
  addCommentSchema,
  createPlanActionSchema,
  uploadFilesSchema,
};
