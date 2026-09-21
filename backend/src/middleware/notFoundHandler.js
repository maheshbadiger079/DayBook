const { errorResponse } = require('../utils/response');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    'ROUTE_NOT_FOUND',
    404
  );
};

module.exports = notFoundHandler;
