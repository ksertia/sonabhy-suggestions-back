const { z } = require('zod');

// Get Notifications Schema
const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    isRead: z.string().optional(),
    type: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Get Notification by ID Schema
const getNotificationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});

// Mark as Read Schema
const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});

// Delete Notification Schema
const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});

// Send Test Notification Schema (for testing)
const sendTestNotificationSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Type is required'),
    message: z.string().min(1, 'Message is required'),
    metadata: z.object({}).optional(),
  }),
});

module.exports = {
  getNotificationsSchema,
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
  sendTestNotificationSchema,
};
