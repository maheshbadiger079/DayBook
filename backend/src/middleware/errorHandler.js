const { errorResponse } = require('../utils/response');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error]: ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  return errorResponse(res, message, errorCode, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

module.exports = errorHandler;
