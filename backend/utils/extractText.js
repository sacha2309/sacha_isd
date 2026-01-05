// import fs from 'fs/promises'; // Import the promise-based version
// import * as pdfParse from 'pdf-parse';

// export async function extractText(filePath) {
//   try {
//     // Use the async 'readFile' for non-blocking I/O
//     const dataBuffer = await fs.readFile(filePath); 
//     const data = await pdfParse(dataBuffer);
    
//     // Simple check to ensure text was extracted
//     if (!data.text || data.text.trim().length === 0) {
//         console.warn(`[PDF Extract] WARNING: No text found in file: ${filePath}`);
//     }

//     return data.text;
//   } catch (error) {
//     console.error(`[PDF Extract] Error processing file ${filePath}:`, error);
//     // Throw an error that your route handler can catch
//     throw new Error(`Failed to extract text from PDF: ${error.message}`);
//   }
// }

// utils/extractText.js
const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract text from a PDF file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      console.warn(`[PDF Extract] WARNING: No text found in file: ${filePath}`);
      return '';
    }
    
    return data.text || '';
  } catch (error) {
    console.error(`[PDF Extract] Error processing file ${filePath}:`, error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = { extractText };
