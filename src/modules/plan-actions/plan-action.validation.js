const { z } = require('zod');

// Create Plan Action Schema
const createPlanActionSchema = z.object({
  body: z.object({
    ideaId: z.string().uuid('Invalid idea ID'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
    description: z.string().optional(),
    progress: z.number().int().min(0, 'Progress must be at least 0').max(100, 'Progress must not exceed 100').optional().default(0),
    deadline: z.string().datetime('Invalid datetime format').optional(),
    assignedTo: z.string().uuid('Invalid user ID').optional(),
    taches: z.array(z.any()).optional(),
  }),
});

// Update Plan Action Schema
const updatePlanActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan action ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    deadline: z.string().datetime().optional(),
    assignedTo: z.string().uuid().optional(),
    taches: z.array(z.any()).optional(),
  }),
});

// Get Plan Action Schema
const getPlanActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan action ID'),
  }),
});

// Delete Plan Action Schema
const deletePlanActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan action ID'),
  }),
});

// List Plan Actions Schema (Query Filters)
const listPlanActionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    ideaId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    progressMin: z.string().regex(/^\d+$/).optional(),
    progressMax: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['completed', 'in_progress', 'not_started']).optional(),
    overdue: z.string().optional(),
    deadlineStart: z.string().datetime().optional(),
    deadlineEnd: z.string().datetime().optional(),
    search: z.string().optional(),
  }),
});

// Get Plan Actions by Idea Schema
const getPlanActionsByIdeaSchema = z.object({
  params: z.object({
    ideaId: z.string().uuid('Invalid idea ID'),
  }),
});

// Update Progress Schema
const updateProgressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan action ID'),
  }),
  body: z.object({
    progress: z.number().int().min(0, 'Progress must be at least 0').max(100, 'Progress must not exceed 100'),
  }),
});

// Assign User Schema
const assignUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan action ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

// Get Stats by Idea Schema
const getStatsByIdeaSchema = z.object({
  params: z.object({
    ideaId: z.string().uuid('Invalid idea ID'),
  }),
});

module.exports = {
  createPlanActionSchema,
  updatePlanActionSchema,
  getPlanActionSchema,
  deletePlanActionSchema,
  listPlanActionsSchema,
  getPlanActionsByIdeaSchema,
  updateProgressSchema,
  assignUserSchema,
  getStatsByIdeaSchema,
};
