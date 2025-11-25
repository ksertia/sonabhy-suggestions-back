const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    username:z.string().min(4, "username is required"),
    phone: z.string().optional(),
    role: z.enum(['USER', 'MANAGER', 'ADMIN']).optional().default('USER'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    login: z.string().min(1, 'login is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
