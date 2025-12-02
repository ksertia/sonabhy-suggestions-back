const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const fileRoutes = require('./modules/files/file.routes');
const ideaRoutes = require('./modules/ideas/idea.routes');
const formRoutes = require('./modules/forms/form.routes');
const classificationRoutes = require('./modules/Classification/classification.routes')
const planActionRoutes = require('./modules/plan-actions/plan-action.routes');
const tacheRoutes = require('./modules/taches/tache.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Idea Box API Documentation',
}));

app.get("/api-docs.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes classificationRoutes
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/files`, fileRoutes);
app.use(`${apiPrefix}/ideas`, ideaRoutes);
app.use(`${apiPrefix}/classification`, classificationRoutes);
app.use(`${apiPrefix}/forms`, formRoutes);
app.use(`${apiPrefix}/plan-actions`, planActionRoutes);
app.use(`${apiPrefix}/taches`, tacheRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
