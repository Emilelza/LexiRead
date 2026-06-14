/**
 * services/documentService.js
 * Handles extraction of text from uploaded files (PDF, TXT, DOCX).
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract plain text from a TXT file.
 */
const extractFromTxt = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

/**
 * Extract plain text from a PDF using a pure-JS approach.
 * Falls back to a readable error if extraction fails.
 */
const extractFromPdf = async (filePath) => {
  try {
    // Use pdf-parse if available, otherwise read raw bytes
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    // If pdf-parse not installed, return a helpful message
    const buffer = fs.readFileSync(filePath);
    // Very basic text extraction: grab printable ASCII sequences
    const raw = buffer.toString('latin1');
    const extracted = raw
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim();
    return extracted.length > 100
      ? extracted
      : 'PDF text extraction requires the pdf-parse package. Please install it with: npm install pdf-parse';
  }
};

/**
 * Extract text from a DOCX file using basic XML parsing.
 */
const extractFromDocx = async (filePath) => {
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(filePath);
    const xml = zip.readAsText('word/document.xml');
    // Strip XML tags and decode common entities
    return xml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } catch {
    return 'DOCX extraction failed. Please convert to TXT and try again.';
  }
};

/**
 * Main extraction dispatcher.
 * @param {object} file - Multer file object
 * @returns {Promise<string>} - Extracted text
 */
const extractText = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (mime === 'text/plain' || ext === '.txt') {
    return extractFromTxt(file.path);
  }

  if (mime === 'application/pdf' || ext === '.pdf') {
    return extractFromPdf(file.path);
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    return extractFromDocx(file.path);
  }

  throw new Error(`Unsupported file type: ${ext}`);
};

/**
 * Clean up an uploaded temp file.
 * @param {string} filePath
 */
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`⚠️ Could not delete temp file: ${filePath}`, err.message);
  }
};

module.exports = { extractText, cleanupFile };
