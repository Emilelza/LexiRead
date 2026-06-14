/**
 * controllers/chatController.js
 * Handles AI chat assistant requests.
 */

const { chatWithAssistant } = require('../services/aiService');
const { sanitizeText } = require('../utils/sanitize');
const { success, error } = require('../utils/response');

/**
 * POST /api/chat
 * Chat with the AI about a document or general study topics.
 */
const chat = async (req, res, next) => {
  try {
    const { message, documentContext, history } = req.body;

    const msgResult = sanitizeText(message);
    if (!msgResult.valid) {
      return error(res, msgResult.error, 400);
    }

    // Sanitize history: ensure it's an array of valid message objects
    let safeHistory = [];
    if (Array.isArray(history)) {
      safeHistory = history
        .filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
        .slice(-20); // max 20 history turns
    }

    const context = documentContext ? String(documentContext).slice(0, 8000) : '';

    const reply = await chatWithAssistant(msgResult.text, context, safeHistory);
    return success(res, { reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
