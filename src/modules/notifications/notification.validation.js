const { z } = require("zod");

// Allowed enums for safety
const NotificationTargetEnum = z.enum(["USER", "ROLE", "SYSTEM"]);


const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),

    type: z.string().min(1, "Message is required"),
    target: NotificationTargetEnum.default("USER"),

    // Only required if target = USER
    userId: z.string().uuid().optional(),
  }),
});

// -----------------------------------------
// GET /notifications
// -----------------------------------------
const getNotificationsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional()
      .default("1"),

    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional()
      .default("20"),

    read: z
      .string()
      .optional()
      .transform((v) =>
        v === undefined ? undefined : v === "true" ? true : false
      ),

    type: z.string().optional(),
    target: NotificationTargetEnum.optional(),

    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

// -----------------------------------------
// GET /notifications/:id
// -----------------------------------------
const getNotificationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notification ID"),
  }),
});

// -----------------------------------------
// PATCH /notifications/:id/read
// -----------------------------------------
const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notification ID"),
  }),
});

// -----------------------------------------
// DELETE /notifications/:id
// -----------------------------------------
const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid notification ID"),
  }),
});

// -----------------------------------------
// POST /notifications/test (for testing)
// -----------------------------------------
const sendTestNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    type: z.string().min(1, "type is required"),

    // type: NotificationTypeEnum.default("INFO"),
    target: NotificationTargetEnum.default("USER"),

    userId: z.string().uuid().optional(),
    role: z.string().optional(),

    entityId: z.string().optional(),
    entityType: z.string().optional(),
  }),
});

module.exports = {
  getNotificationsSchema,
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
  sendTestNotificationSchema,
  createNotificationSchema
};
