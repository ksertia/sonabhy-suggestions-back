const { z } = require('zod');

const uploadFileSchema = z.object({
  file: z.any(), // File validation handled by multer
});

const uploadMultipleFilesSchema = z.object({
  files: z.any(), // Files validation handled by multer
});

const getFileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid file ID'),
  }),
});

const deleteFileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid file ID'),
  }),
});

const listFilesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    uploadedById: z.string().uuid().optional(),
    mimeType: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

const getFilesByIdeaSchema = z.object({
  params: z.object({
    ideaId: z.string().uuid('Invalid idea ID'),
  }),
});

const downloadFileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid file ID'),
  }),
});

module.exports = {
  uploadFileSchema,
  uploadMultipleFilesSchema,
  getFileSchema,
  deleteFileSchema,
  listFilesSchema,
  getFilesByIdeaSchema,
  downloadFileSchema,
};
