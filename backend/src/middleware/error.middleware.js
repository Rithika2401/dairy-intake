/**
 * Centralized API Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[API Error]: ${req.method} ${req.originalUrl} -`, err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR');
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details || err.stack })
    }
  });
}

module.exports = { errorHandler };
