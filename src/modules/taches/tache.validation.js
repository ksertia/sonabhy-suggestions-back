const { z } = require('zod');

// ---------------------------------------------------
// CREATE ONE TACHE
// ---------------------------------------------------
const createTacheSchema = z.object({
  body: z.object({
    planActionId: z.string().uuid('Invalid plan action ID'),
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must not exceed 200 characters'),
    description: z.string().optional(),
    progress: z.number().int().min(0).max(100).optional().default(0),
    deadline: z.string().datetime('Invalid datetime format').optional(),
  }),
});

// ---------------------------------------------------
// CREATE MULTIPLE TACHES (bulk)
// ---------------------------------------------------
const createMultipleTachesSchema = z.object({
  params: z.object({
    planActionId: z.string().uuid('Invalid plan action ID'),
  }),
  body: z.object({
    taches: z.array(z.object({
      title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters'),
      description: z.string().optional(),
      progress: z.number().int().min(0).max(100).optional().default(0),
      deadline: z.string().datetime().optional(),
    })).min(1, 'At least one tache is required'),
  }),
});

// ---------------------------------------------------
// UPDATE TACHE
// ---------------------------------------------------
const updateTacheSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid tache ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    deadline: z.string().datetime().optional(),
  }),
});

// ---------------------------------------------------
// UPDATE PROGRESS
// ---------------------------------------------------
const updateProgressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid tache ID'),
  }),
  body: z.object({
    progress: z.number()
      .min(0, 'Progress must be at least 0')
      .max(100, 'Progress must not exceed 100'),
  }),
});

// ---------------------------------------------------
// ASSIGN MULTIPLE USERS
// ---------------------------------------------------
const assignUsersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid tache ID'),
  }),
  body: z.object({
    userIds: z.array(z.string().uuid('Invalid user ID'))
      .min(1, 'At least one user ID is required'),
  }),
});

module.exports = {
  createTacheSchema,
  createMultipleTachesSchema,
  updateTacheSchema,
  updateProgressSchema,
  assignUsersSchema,
};
