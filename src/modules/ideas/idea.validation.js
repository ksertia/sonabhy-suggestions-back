const { z } = require('zod');

// Create Idea Schema
const createIdeaSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),

    description: z.string()
      .min(10, "Description must be at least 10 characters"),

    data: z.any().optional(),  // tu peux remplacer par z.record(...) si structuré

    isAnonymous: z.boolean().default(false),
    userId: z.string().uuid().nullable().optional(),

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
    isAnonymous: z.boolean().optional(),

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),

    formVariantId: z.string().uuid().optional(),
  })
})
.refine(
  (input) => {
    const b = input.body;
    if (!b.isAnonymous) return true;

    // Si l'utilisateur met isAnonymous = true dans un update → les 3 champs deviennent obligatoires
    return !!(b.firstName && b.lastName && b.email);
  },
  {
    message: "firstName, lastName and email are required when isAnonymous = true",
    path: ["body"],
  }
);


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
