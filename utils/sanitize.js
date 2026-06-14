/**
 * utils/sanitize.js
 * Input sanitization helpers to prevent injection and abuse.
 */

const MAX_TEXT_LENGTH = 15000; // ~10 pages of text

/**
 * Sanitize and validate a text input.
 * @param {string} text - Raw input text
 * @returns {{ valid: boolean, text: string, error?: string }}
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required.' };
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Text cannot be empty.' };
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text is too long. Maximum ${MAX_TEXT_LENGTH.toLocaleString()} characters allowed.`,
    };
  }

  // Strip null bytes and control characters (keep newlines, tabs)
  const clean = trimmed.replace(/\x00/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return { valid: true, text: clean };
};

/**
 * Sanitize a mode string against a whitelist.
 * @param {string} mode - Requested AI mode
 * @param {string[]} allowed - Array of allowed mode names
 * @returns {{ valid: boolean, mode?: string, error?: string }}
 */
const sanitizeMode = (mode, allowed) => {
  if (!mode || typeof mode !== 'string') {
    return { valid: false, error: 'Mode is required.' };
  }
  if (!allowed.includes(mode)) {
    return { valid: false, error: `Invalid mode. Allowed: ${allowed.join(', ')}` };
  }
  return { valid: true, mode };
};

module.exports = { sanitizeText, sanitizeMode };
