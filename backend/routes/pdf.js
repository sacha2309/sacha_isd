const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // extract text from PDFs
const router = express.Router();

// Optional: auth middleware
const verifyToken = require('./authMiddleware'); 

// POST /api/pdf/search
router.post('/search', verifyToken, async (req, res) => {
    try {
        const { filename, term } = req.body;
        if (!filename || !term) return res.status(400).json({ error: 'Filename and term required' });

        const pdfPath = path.join(__dirname, '../pdfs', filename);
        if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF not found' });

        const pdfBuffer = fs.readFileSync(pdfPath);

        // Use pdf-parse to get text by page
        const data = await pdfParse(pdfBuffer);
        const pages = data.text.split('\f'); // pdf-parse splits pages by form feed character

        const matches = [];

        pages.forEach((pageText, pageIndex) => {
            const lines = pageText.split('\n');

            lines.forEach((line) => {
                if (line.toLowerCase().includes(term.toLowerCase())) {
                    matches.push({
                        page: pageIndex + 1,            // page numbers start at 1
                        textSnippet: line.trim()         // snippet of matched line
                    });
                }
            });
        });

        res.json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during PDF search' });
    }
});

module.exports = router;
