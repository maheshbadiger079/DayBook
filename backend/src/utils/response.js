/**
 * Standard Success Response Formatter
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard Error Response Formatter
 */
const errorResponse = (res, message = 'Internal Server Error', errorCode = 'SERVER_ERROR', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    error: errorCode,
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
