// utils/extractText.js
const fs = require('fs').promises;
const pdf = require('pdf-parse');

/**
 * Extract text from a PDF file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    if (!data.text || data.text.trim().length === 0) {
      console.warn(`[PDF Extract] WARNING: No text found in file: ${filePath}`);
      return '';
    }

    return data.text;
  } catch (error) {
    console.error(`[PDF Extract] Error processing file ${filePath}:`, error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = { extractText };
