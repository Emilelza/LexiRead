/**
 * middleware/errorHandler.js
 * Global Express error handler. Catches all unhandled errors and formats them consistently.
 */

const { nodeEnv } = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  console.error(`❌ [${req.method} ${req.path}] ${status}: ${message}`);
  if (nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: nodeEnv === 'production' && status === 500
      ? 'Something went wrong. Please try again.'
      : message,
  });
};

module.exports = errorHandler;
