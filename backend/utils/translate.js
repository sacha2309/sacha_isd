// utils/translate.js - Using Google Gemini AI
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Language code to full name mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'ar': 'Arabic',
  'fr': 'French',
  'es': 'Spanish',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish'
};

/**
 * Translate text using Google Gemini AI with chunking for large texts
 * @param {string} text - Text to translate
 * @param {string} language - Target language code (ex: 'en', 'ar', 'fr')
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, language) {
  if (!text || !language) throw new Error('Missing text or language');

  try {
    const targetLanguage = LANGUAGE_NAMES[language] || language;
    console.log('🌍 Starting translation to:', targetLanguage);
    console.log('📊 Total text length:', text.length, 'chars');
    
    // Split text into chunks of 2000 characters
    const chunkSize = 2000;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    
    console.log('📦 Split into', chunks.length, 'chunks');
    
    // Translate all chunks
    const translatedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🤖 Translating chunk ${i + 1}/${chunks.length}...`);
      
      const prompt = `Translate the following text to ${targetLanguage}. Provide ONLY the translation without any explanations or additional text. This is part ${i + 1} of ${chunks.length} of a larger document, so maintain context.

Text to translate:
${chunks[i]}`;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      translatedChunks.push(result.text.trim());
      console.log(`✅ Chunk ${i + 1} completed`);
      
      // Small delay between requests to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('✅ All chunks translated successfully');
    return translatedChunks.join('\n\n');
    
    return result.text.trim();
  } catch (error) {
    console.error('🔴 Gemini Translation error:', error);
    throw new Error('Could not translate text with Gemini AI.');
  }
}

module.exports = { translateText };
