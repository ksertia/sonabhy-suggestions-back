const { z } = require('zod');

// Get Overview Stats Schema
const getOverviewStatsSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Get Monthly Trends Schema
const getMonthlyTrendsSchema = z.object({
  query: z.object({
    months: z.string().regex(/^\d+$/).transform(Number).optional().default('12'),
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
  }),
});

// Get Top Categories Schema
const getTopCategoriesSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    userId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Get Status Distribution Schema
const getStatusDistributionSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Get Plan Actions Progress Schema
const getPlanActionsProgressSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
    ideaId: z.string().uuid().optional(),
  }),
});

// Get Ideas Transformed Schema
const getIdeasTransformedSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Get Recent Ideas Schema
const getRecentIdeasSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('5'),
    userId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    statusId: z.string().uuid().optional(),
  }),
});

module.exports = {
  getOverviewStatsSchema,
  getMonthlyTrendsSchema,
  getTopCategoriesSchema,
  getStatusDistributionSchema,
  getPlanActionsProgressSchema,
  getIdeasTransformedSchema,
  getRecentIdeasSchema,
};
