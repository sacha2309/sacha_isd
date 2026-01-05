const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function summarizeText(text, maxSentences = 5) {
  if (!text || !text.trim()) throw new Error("Text is empty");

  const prompt = `You are a professional news summarizer. Summarize the following text in ${maxSentences} concise bullet points in the original language:

${text}

Summary:`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return result.text.trim();
}

module.exports = { summarizeText };
