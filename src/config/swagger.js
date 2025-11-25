const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Idea Box API',
      version: '1.0.0',
      description: 'REST API with Express.js, Prisma, JWT authentication, and file upload',
      contact: {
        name: 'API Support',
        email: 'support@ideabox.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}${process.env.API_PREFIX || '/api/v1'}`,
        description: 'Development server',
      },
      {
        url: `https://idea-box-backend.onrender.com${process.env.API_PREFIX || '/api/v1'}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['USER', 'MANAGER', 'ADMIN'],
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            originalName: {
              type: 'string',
            },
            filename: {
              type: 'string',
            },
            mimetype: {
              type: 'string',
            },
            size: {
              type: 'integer',
            },
            path: {
              type: 'string',
            },
            uploadedById: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
