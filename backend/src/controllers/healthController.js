const { testConnection } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Health Check Controller
 * Returns API server status, uptime, and tests PostgreSQL database connection.
 */
const getHealthStatus = async (req, res, next) => {
  try {
    const dbStatus = await testConnection();

    const healthData = {
      app: 'WorkTrack API',
      status: dbStatus.connected ? 'healthy' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      system: {
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
    };

    if (!dbStatus.connected) {
      return errorResponse(
        res,
        'Database connection unavailable',
        'DATABASE_UNAVAILABLE',
        503,
        healthData
      );
    }

    return successResponse(res, healthData, 'WorkTrack API is healthy and connected to PostgreSQL', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthStatus,
};
