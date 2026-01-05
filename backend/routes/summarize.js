// summarize.js - Using Google Gemini AI
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function summarizeText(text, maxSentences = 5) {
  if (!text || text.trim() === '') {
    throw new Error('Text is empty. Cannot summarize.');
  }

  try {
    const prompt = `You are a professional news summarizer. Summarize the following newsletter in ${maxSentences} clear and concise bullet points in its language. Focus on the most important information and key facts.

Newsletter Text:
${text}

Please provide the summary .`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    
    return result.text.trim();
  } catch (error) {
    console.error('Gemini Summarization Error:', error);
    throw new Error('Failed to summarize text with Gemini AI.');
  }
}

module.exports = { summarizeText };
