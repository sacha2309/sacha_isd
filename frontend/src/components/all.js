// src/components/all.js
import axios from "axios";

// Helper function for Summarization (PDF based)
export async function fetchSummary(filename, token) {
    const res = await axios.post(
        "/api/ai/summarize",
        { filename },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// Helper function for Analysis (Text based)
export async function fetchAnalysis(text, token) {
    const res = await axios.post(
        "/api/ai/analyze",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// Helper function for Translation of already-extracted Text (Text based)
export async function fetchTranslation(text, language, token) {
    const res = await axios.post(
        "/api/ai/translate",
        { text, language },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// ⭐ NEW HELPER: Translation of PDF content (Filename based) ⭐
export async function fetchPdfTranslation(filename, language, token) {
    // This calls the server route that handles: 
    // 1. PDF extraction 
    // 2. Text translation
    const res = await axios.post(
        "/api/ai/translate-pdf", 
        { filename, language },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; 
}
// ⭐ NEW HELPER: Text-to-Speech (Read) of PDF content (Filename based) ⭐
export async function fetchRead(filename, voice, token) {
    // This calls the server route that handles: 
    // 1. PDF extraction 
    // 2. Text-to-Speech (TTS) conversion
    const res = await axios.post(
        "/api/ai/read-pdf", // Assuming your server uses a route like /api/ai/read-pdf
        { filename, voice },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // The server is expected to return a path/URL to the generated audio file
    return res.data; 
}