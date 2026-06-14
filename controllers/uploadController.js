/**
 * controllers/uploadController.js
 * Handles document upload and text extraction.
 */

const { extractText, cleanupFile } = require('../services/documentService');
const { success, error } = require('../utils/response');

/**
 * POST /api/upload
 * Upload and extract text from a PDF, TXT, or DOCX file.
 */
const uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return error(res, 'No file uploaded. Please select a PDF, TXT, or DOCX file.', 400);
  }

  try {
    const text = await extractText(req.file);
    cleanupFile(req.file.path); // Delete temp file after extraction

    if (!text || text.trim().length < 10) {
      return error(res, 'Could not extract readable text from this file. Please try a different file.', 422);
    }

    const wordCount = text.trim().split(/\s+/).length;
    return success(res, {
      text: text.trim(),
      wordCount,
      fileName: req.file.originalname,
    });
  } catch (err) {
    cleanupFile(req.file?.path);
    next(err);
  }
};

module.exports = { uploadDocument };
