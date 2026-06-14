/**
 * controllers/simplifyController.js
 * Handles text simplification and AI mode processing.
 */

const { processText, MODES } = require('../services/aiService');
const { sanitizeText, sanitizeMode } = require('../utils/sanitize');
const { success, error } = require('../utils/response');

const ALLOWED_MODES = Object.keys(MODES);

/**
 * POST /api/simplify
 * Process text with a chosen AI mode.
 */
const simplify = async (req, res, next) => {
  try {
    const textResult = sanitizeText(req.body.text);
    if (!textResult.valid) {
      return error(res, textResult.error, 400);
    }

    const mode = req.body.mode || 'easy_reader';
    const modeResult = sanitizeMode(mode, ALLOWED_MODES);
    if (!modeResult.valid) {
      return error(res, modeResult.error, 400);
    }

    const result = await processText(textResult.text, modeResult.mode);
    return success(res, { result, mode: modeResult.mode, modeLabel: MODES[mode].label });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/modes
 * Return available AI modes and their labels.
 */
const getModes = (req, res) => {
  const modes = Object.entries(MODES).map(([key, val]) => ({
    key,
    label: val.label,
  }));
  return success(res, { modes });
};

module.exports = { simplify, getModes };
