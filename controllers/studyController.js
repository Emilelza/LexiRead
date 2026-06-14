/**
 * controllers/studyController.js
 * Handles study material generation (MCQs, flashcards, etc.).
 */

const { generateStudyMaterial } = require('../services/aiService');
const { sanitizeText, sanitizeMode } = require('../utils/sanitize');
const { success, error } = require('../utils/response');

const ALLOWED_STUDY_TYPES = ['mcq', 'flashcards', 'viva_questions', 'mind_map', 'cheat_sheet'];

/**
 * POST /api/study
 * Generate study materials from text.
 */
const generateStudy = async (req, res, next) => {
  try {
    const textResult = sanitizeText(req.body.text);
    if (!textResult.valid) {
      return error(res, textResult.error, 400);
    }

    const studyType = req.body.studyType || 'mcq';
    const typeResult = sanitizeMode(studyType, ALLOWED_STUDY_TYPES);
    if (!typeResult.valid) {
      return error(res, typeResult.error, 400);
    }

    const result = await generateStudyMaterial(textResult.text, typeResult.mode);
    return success(res, { result, studyType: typeResult.mode });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateStudy };
