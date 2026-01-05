import axios from "axios";

// Summarize PDF
export async function fetchSummary(filename, token) {
    const res = await axios.post(
        "/api/ai/summarize",
        { filename },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// Translate extracted text
export async function fetchTranslation(text, language, token) {
    const res = await axios.post(
        "/api/ai/translate",
        { text, language },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}

// Search inside PDFs
export async function fetchPdfSearch(filename, keyword, token) {
    if (!filename || !keyword || keyword.trim() === "") return [];

    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

    const res = await axios.post(
        `${backendUrl}/api/pdf/search`,
        { filename, term: keyword },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data; // Returns [{ page, textSnippet }, ...]
}

// Translate PDF content directly
export async function fetchPdfTranslation(filename, language, token) {
    const res = await axios.post(
        "/api/ai/translate-pdf", 
        { filename, language },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; 
}

// Text-to-Speech (Read PDF)
export async function fetchRead(filename, voice, token) {
    const res = await axios.post(
        "/api/ai/read-pdf",
        { filename, voice },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; 
}

// Search inside PDFs
export async function fetchPdfSearch(keyword) {
    if (!keyword || keyword.trim() === "") return [];
    
    const res = await axios.post("/api/pdfs/search", { keyword });
    return res.data; // Returns [{ filename, textSnippet }, ...]
}
