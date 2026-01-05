const express = require('express');
const path = require('path');
const fs = require('fs');
const { extractText } = require('../utils/extractText');
const { summarizeText } = require('./summarize');
const { translateText } = require('../utils/translate');
const { textToSpeech } = require('./tts');

module.exports = (db) => {
  const router = express.Router();

  // -------------------- Summarize PDF --------------git------
  router.post('/summarize', async (req, res) => {
    const { filename, userId } = req.body;
    if (!filename || !userId) return res.status(400).json({ error: 'Missing filename or userId.' });

    try {
      const pdfPath = path.join(__dirname, '..', 'public_pdfs', filename);
      if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF file not found.' });

      const text = await extractText(pdfPath);
      const summary = await summarizeText(text);

      // Save summary to DB
      const result = await db.query(
        'INSERT INTO summaries (user_id, filename, summary) VALUES ($1, $2, $3) RETURNING *',
        [userId, filename, summary]
      );

      res.json({ summary, text, dbEntry: result.rows[0] });
    } catch (err) {
      console.error('Error summarizing PDF:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------- Translate PDF --------------------
  router.post('/translate', async (req, res) => {
    const { filename, language, userId } = req.body;
    if (!filename || !language || !userId)
      return res.status(400).json({ error: 'Missing filename, language, or userId.' });

    try {
      const pdfPath = path.join(__dirname, '..', 'public_pdfs', filename);
      if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF file not found.' });

      const text = await extractText(pdfPath);
      if (!text || !text.trim()) return res.status(404).json({ error: 'No text extracted from PDF.' });

      const translatedText = await translateText(text, language);

      // Save translation to DB
      const result = await db.query(
        'INSERT INTO translations (user_id, filename, original_text, translated_text, language) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, filename, text, translatedText, language]
      );

      res.json({
        originalText: text,
        translatedText,
        language,
        dbEntry: result.rows[0]
      });
    } catch (err) {
      console.error('Error translating PDF:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------- Read PDF (TTS) --------------------
  router.post('/read-pdf', async (req, res) => {
    const { filename, voice } = req.body;
    if (!filename || !voice) return res.status(400).json({ error: 'Missing filename or voice selection.' });

    try {
      const pdfPath = path.join(__dirname, '..', 'public_pdfs', filename);
      if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF file not found.' });

      const text = await extractText(pdfPath);
      if (!text || !text.trim()) return res.status(404).json({ error: 'No text extracted from PDF.' });

      const ttsFolder = path.join(__dirname, '..', 'public_tts');
      if (!fs.existsSync(ttsFolder)) fs.mkdirSync(ttsFolder, { recursive: true });

      const ttsFileName = `tts_${Date.now()}.wav`;
      const ttsFilePath = path.join(ttsFolder, ttsFileName);

      await textToSpeech(text, ttsFilePath, voice);

      const ttsPublicPath = `/public_tts/${ttsFileName}`;
      res.json({ ttsFile: ttsPublicPath });
    } catch (err) {
      console.error('Error processing read-pdf:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
