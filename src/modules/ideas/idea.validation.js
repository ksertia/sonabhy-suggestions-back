const { Visibility } = require('@prisma/client');
const { z } = require('zod');

// Create Idea Schema
const createIdeaSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),
    description: z.string()
      .min(10, "Description must be at least 10 characters"),
    data: z.any().optional(),
    qualifiedAt: z.datetime().optional(),
    approvedAt: z.datetime().optional(),
    isAnonymous: z.boolean().default(false),
    forVote: z.boolean().default(false),
    status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'VALIDATED', 'ACTION_PLAN', 'QUALIFIED']).default('SUBMITTED'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    impact: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'TRANSFORMATIONAL']).optional(),
    visibility: z.enum(['TEAM', 'PRIVATE', 'PUBLIC']).default('PRIVATE'),
    categoryId: z.string().uuid().nullable().optional(),
    kindId: z.string().uuid().nullable().optional(),
    userId: z.string().uuid().nullable().optional(),
    qualifiedBy: z.string().uuid().nullable().optional(),
    approvedBy: z.string().uuid().nullable().optional(),
    metadataId: z.string().uuid().nullable().optional(),
    formVariantId: z.string().uuid("Invalid form variant ID"),
  })
});



// Update Idea Schema
const updateIdeaSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid idea ID"),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).optional(),
    data: z.any().optional(),
    qualifiedAt: z.datetime().optional(),
    approvedAt: z.datetime().optional(),
    isAnonymous: z.boolean().optional(),
    forVote: z.boolean().default(false),
    status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED', 'VALIDATED', 'ACTION_PLAN', 'QUALIFIED']).default('SUBMITTED'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    impact: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'TRANSFORMATIONAL']).optional(),
    visibility: z.enum(['TEAM', 'PRIVATE', 'PUBLIC']).default('PRIVATE'),
    categoryId: z.string().uuid().nullable().optional(),
    kindId: z.string().uuid().nullable().optional(),
    userId: z.string().uuid().nullable().optional(),
    qualifiedBy: z.string().uuid().nullable().optional(),
    approvedBy: z.string().uuid().nullable().optional(),
    metadataId: z.string().uuid().nullable().optional(),
    formVariantId: z.string().uuid().optional(),
  })
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
    formVariantId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    isAnonymous: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
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
