/**
 * middleware/rateLimiter.js
 * Rate limiting for API routes to prevent abuse.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment before trying again.',
  },
});

module.exports = { apiLimiter };
