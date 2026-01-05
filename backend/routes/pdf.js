// routes/pdf.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { summarizeText } = require("../summarize");
const { translateText } = require("../utils/translate");
const { textToSpeech } = require("./tts");

const router = express.Router();

// Directory where PDFs are stored
const PDF_DIR = path.join(__dirname, "..", "public_pdfs");

// -------------------- GET all PDFs --------------------
router.get("/", (req, res) => {
  const pdfs = [
    { title: "The Associated Press", filename: "ap.pdf" },
    { title: "Haaretz", filename: "Haaretz.pdf" },
    { title: "El Mundo", filename: "el mundo.pdf" },
    { title: "Le Parisien", filename: "le parisien.pdf" },
    { title: "جريدة الاخبار", filename: "الاخبار.pdf" }
  ];
  res.json(pdfs);
});

// -------------------- SEARCH inside PDFs --------------------
router.post("/search", async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: "Keyword required" });

  const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith(".pdf"));
  const results = [];

  for (const file of files) {
    try {
      const buffer = fs.readFileSync(path.join(PDF_DIR, file));
      const data = await pdfParse(buffer);

      const idx = data.text.toLowerCase().indexOf(keyword.toLowerCase());
      if (idx !== -1) {
        const snippetStart = Math.max(0, idx - 50);
        const snippetEnd = Math.min(data.text.length, idx + keyword.length + 50);
        const snippet = data.text.substring(snippetStart, snippetEnd).replace(/\s+/g, " ");

        results.push({ filename: file, textSnippet: snippet });
      }
    } catch (err) {
      console.error(`Error reading PDF ${file}:`, err);
    }
  }

  res.json(results);
});

// -------------------- SUMMARIZE PDF --------------------
router.post("/summarize", async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: "Missing filename" });

  const pdfPath = path.join(PDF_DIR, filename);
  if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: "PDF not found" });

  try {
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);
    const summary = await summarizeText(data.text);

    res.json({ summary, text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- TRANSLATE PDF --------------------
router.post("/translate", async (req, res) => {
  const { filename, language } = req.body;
  if (!filename || !language) return res.status(400).json({ error: "Missing filename or language" });

  const pdfPath = path.join(PDF_DIR, filename);
  if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: "PDF not found" });

  try {
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);
    const translatedText = await translateText(data.text, language);

    res.json({ originalText: data.text, translatedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- READ PDF (TTS) --------------------
router.post("/read", async (req, res) => {
  const { filename, voice } = req.body;
  if (!filename || !voice) return res.status(400).json({ error: "Missing filename or voice" });

  const pdfPath = path.join(PDF_DIR, filename);
  if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: "PDF not found" });

  try {
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);

    const TTS_DIR = path.join(__dirname, "..", "public_tts");
    if (!fs.existsSync(TTS_DIR)) fs.mkdirSync(TTS_DIR, { recursive: true });

    const ttsFileName = `tts_${Date.now()}.wav`;
    const ttsFilePath = path.join(TTS_DIR, ttsFileName);

    await textToSpeech(data.text, ttsFilePath, voice);

    res.json({ ttsFile: `/public_tts/${ttsFileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
