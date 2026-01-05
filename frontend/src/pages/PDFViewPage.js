import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import { fetchPdfTranslation, fetchSummary, fetchRead } from '../components/all.js';

pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewPage = () => {
    const { filename } = useParams();
    const cleanFilename = filename || '';

    const navigate = useNavigate();

    const [language, setLanguage] = useState('English');
    const [voice, setVoice] = useState('Female');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);

    const authToken = localStorage.getItem('token');
    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; 
    const pdfSourceUrl = cleanFilename ? `${backendUrl}/pdfs/${cleanFilename}` : null;

    const getResultHeading = () => {
        const baseName = cleanFilename.length > 30 ? cleanFilename.substring(0, 27) + '...' : cleanFilename;

        if (!currentAction) return "AI Results";
        if (currentAction === 'Translate') return `Translated to ${language}`;
        if (currentAction === 'Summarize') return `Summarized: ${baseName}`;
        if (currentAction === 'Read') return `Text-to-Speech Output`;
        return "AI Results";
    };

    // --- Summarize ---
    const handleSummarize = async () => {
        if (!cleanFilename) return setResult('Error: Cannot summarize. PDF filename not found.');
        if (!authToken) return setResult("❌ Please register or login first.");

        setLoading(true); setResult(''); setCurrentAction('Summarize');
        try {
            const data = await fetchSummary(cleanFilename, authToken);
            setResult(`📄 Summary:\n${data.summary}`);
        } catch (err) {
            setResult(`Error: ${err.response?.data?.error || err.message}`);
        }
        setLoading(false);
    };

    // --- Translate ---
    const handleTranslate = async () => {
        if (!cleanFilename) return setResult('Error: Cannot translate. PDF filename not found.');
        if (!authToken) return setResult("❌ Please register or login first.");

        setLoading(true); setResult(''); setCurrentAction('Translate');
        try {
            const languageCode = language.toLowerCase().substring(0, 2);
            const data = await fetchPdfTranslation(cleanFilename, languageCode, authToken);
            setResult(`🌍 Translated to ${language}:\n${data.translatedText}`);
        } catch (err) {
            setResult(`Error: ${err.response?.data?.error || err.message}`);
        }
        setLoading(false);
    };

    // --- Read ---
    const handleRead = async () => {
        if (!cleanFilename) return setResult('Error: Cannot read. PDF filename not found.');
        if (!authToken) return setResult("❌ Please register or login first.");

        setLoading(true); setResult(''); setCurrentAction('Read');
        try {
            const data = await fetchRead(cleanFilename, voice, authToken);
            const ttsFile = data.ttsFile;
            if (!ttsFile) throw new Error('Server returned no audio file URL.');

            const fullAudioUrl = ttsFile.startsWith('http') ? ttsFile : `${backendUrl}/${ttsFile}`;
            setResult(`🗣️ **Audio Ready!**\n\n<audio controls src="${fullAudioUrl}">Your browser does not support the audio element.</audio>`);
        } catch (err) {
            setResult(err.response?.status === 403 ? "❌ Please register or login first." : `Error: ${err.response?.data?.error || err.message}`);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        backgroundColor: '#34495e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 15px',
                        fontWeight: 'bold',
                    }}
                >
                    ⬅️ Back to Dashboard
                </button>
            </div>

            {/* 3 Action Buttons */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Translate */}
                <div>
                    <button onClick={handleTranslate} style={{ backgroundColor: '#1abc9c', color: 'white', border: 'none', borderRadius: '8px', padding: '18px 0', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>🌍 Translate</button>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', marginTop: '8px' }}>
                        <option>English</option><option>Arabic</option><option>French</option><option>Spanish</option><option>German</option>
                    </select>
                </div>
                {/* Read */}
                <div>
                    <button onClick={handleRead} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', padding: '18px 0', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>🗣️ Read</button>
                    <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', marginTop: '8px' }}>
                        <option>Female</option><option>Male</option>
                    </select>
                </div>
                {/* Summarize */}
                <div>
                    <button onClick={handleSummarize} style={{ backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '8px', padding: '18px 0', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>🧾 Summary</button>
                </div>
            </div>

            {/* PDF + Results */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* PDF Viewer */}
                <div style={{ flex: 2, border: '1px solid #ccc', borderRadius: '6px', padding: '10px', backgroundColor: '#f8f8f8', overflow: 'hidden' }}>
                    {cleanFilename ? (
                        <embed src={pdfSourceUrl} type="application/pdf" width="100%" height="800px" style={{ border: 'none', overflow: 'hidden' }} />
                    ) : (
                        <p style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
                            No PDF selected. Please open a PDF from the dashboard.
                        </p>
                    )}
                </div>

                {/* AI Result */}
                <div style={{ flex: 1, backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '6px', padding: '15px', minHeight: '650px' }}>
                    <h3 style={{ textAlign: 'center' }}>{getResultHeading()}</h3>
                    {loading ? <p style={{ textAlign: 'center', color: 'gray' }}>⏳ Processing...</p>
                        : result ? <div style={{ backgroundColor: '#ecf0f1', padding: '15px', borderRadius: '6px', whiteSpace: 'pre-line', overflowY: 'auto', height: '500px' }}>{result}</div>
                        : <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Click Translate, Summarize, or Read.</p>}
                </div>
            </div>
        </div>
    );
};

export default PDFViewPage;
