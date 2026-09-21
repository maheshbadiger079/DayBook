const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const entryRoutes = require('./routes/entryRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const { successResponse } = require('./utils/response');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiter to prevent abuse / brute force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    error: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api', apiLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Root greeting / meta
app.get('/api', (req, res) => {
  return successResponse(
    res,
    {
      name: 'Daybook & WorkTrack API',
      version: '1.0.0',
      tagline: 'Track activities, projects and assignments by date',
      documentation: '/api/docs',
      healthCheck: '/api/health',
      endpoints: [
        '/api/health',
        '/api/entries',
      ],
    },
    'Welcome to Daybook REST API'
  );
});

// Register Core Routes
app.use('/api/health', healthRoutes);
app.use('/api/entries', entryRoutes);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
