/**
 * controllers/explainController.js
 * Handles word explanation requests.
 */

const { explainWord } = require('../services/aiService');
const { success, error } = require('../utils/response');

/**
 * POST /api/explain-word
 * Explain a single word with definition, synonyms, pronunciation, and example.
 */
const explain = async (req, res, next) => {
  try {
    const { word, context } = req.body;

    if (!word || typeof word !== 'string' || !word.trim()) {
      return error(res, 'A word is required.', 400);
    }

    const cleanWord = word.trim().slice(0, 60); // cap word length
    const cleanContext = context ? String(context).trim().slice(0, 300) : '';

    const result = await explainWord(cleanWord, cleanContext);
    return success(res, { result });
  } catch (err) {
    next(err);
  }
};

module.exports = { explain };
