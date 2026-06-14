/**
 * utils/response.js
 * Centralized API response helpers for consistent JSON output.
 */

/**
 * Send a successful JSON response.
 * @param {object} res - Express response object
 * @param {*} data - Payload to send
 * @param {number} [status=200] - HTTP status code
 */
const success = (res, data, status = 200) => {
  res.status(status).json({ success: true, ...data });
};

/**
 * Send an error JSON response.
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {number} [status=500] - HTTP status code
 */
const error = (res, message, status = 500) => {
  res.status(status).json({ success: false, error: message });
};

module.exports = { success, error };
