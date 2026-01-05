import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetchPdfTranslation, fetchSummary, fetchRead } from '../components/all.js';

//pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewPage = () => {
    const { filename } = useParams();
const cleanFilename = filename || '';

    const navigate = useNavigate();

    const [numPages, setNumPages] = useState(null);
    //const [pageNumber, setPageNumber] = useState(1);
    const [pdfError, setPdfError] = useState(null);
    const [language, setLanguage] = useState('English');
    const [voice, setVoice] = useState('Female');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [currentAction, setCurrentAction] = useState(null);

    const authToken = localStorage.getItem('token');
    const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; // fallback for local dev
const pdfSourceUrl = cleanFilename
    ? `${backendUrl}/pdfs/${cleanFilename}`
    : null;
 

    // Heading Logic (Analyze removed)
    const getResultHeading = () => {
        const baseName = cleanFilename.length > 30 ? cleanFilename.substring(0, 27) + '...' : cleanFilename;

        if (!currentAction) return "AI Results";

        if (currentAction === 'Translate') return `Translated to ${language}`;
        if (currentAction === 'Summarize') return `Summarized: ${baseName}`;
        if (currentAction === 'Read') return `Text-to-Speech Output`;

        return "AI Results";
    };

    // useEffect(() => {
    //     if (!cleanFilename.trim()) {
    //         setPdfError("Error: No PDF filename found. Please open a PDF from the dashboard.");
    //     } else {
    //         setPdfError(null);
    //     }
    // }, [cleanFilename]);

    // function onDocumentLoadSuccess({ numPages }) {
    //     setNumPages(numPages);
    //     setPdfError(null);
    // }

    // function onDocumentLoadError(error) {
    //     const errorMessage = error.message || 'The PDF worker script or the file could not be found.';
    //     setPdfError(`Failed to load PDF: ${errorMessage}`);
    // }

    // --- Summarize ---
    const handleSummarize = async () => {
        if (!cleanFilename) {
            setResult('Error: Cannot summarize. PDF filename not found.');
            return;
        }
        
        setLoading(true);
        setResult('');
        setCurrentAction('Summarize');

        try {
            const data = await fetchSummary(cleanFilename, authToken);
            setResult(`📄 Summary:\n${data.summary}`);
        } catch (err) {
            if (err.response?.status === 403) {
    setResult("❌ Please register or login first.");
} else {
    setResult(`Error: Could not summarize document. ${err.response?.data?.error || err.message}`);
}

        }
        setLoading(false);
    };

    // --- Translate ---
    const handleTranslate = async () => {
        const filenameToSend = cleanFilename;
        const languageCode = language.toLowerCase().substring(0, 2);

        if (!filenameToSend) {
            setResult('Error: Cannot translate. PDF filename not found.');
            return;
        }

        setLoading(true);
        setResult('');
        setCurrentAction('Translate');
        
        try {
            const data = await fetchPdfTranslation(filenameToSend, languageCode, authToken);
            const translatedText = data.translatedText;

            if (!translatedText) throw new Error('Server returned no translation.');

            setResult(`🌍 Translated to ${language}:\n${translatedText}`);
        } catch (err) {
            if (err.response?.status === 403) {
    setResult("❌ Please register or login first.");
} else {
    setResult(`Error: Could not translate document. Details: ${err.message}`);
}

        }

        setLoading(false);
    };

    // --- Read (Text-to-Speech) ---
  // --- Read (Text-to-Speech) ---
    const handleRead = async () => {
        const filenameToSend = cleanFilename;

        if (!filenameToSend) {
            setResult('Error: Cannot read. PDF filename not found.');
            return;
        }

        setLoading(true);
        setResult('');
        setCurrentAction('Read');

        try {
            // Use the imported fetchRead utility, passing filename, voice, and token.
            // Assuming fetchRead is designed to handle the entire "extract and read" process on the backend.
            const data = await fetchRead(filenameToSend, voice, authToken);

            const ttsFile = data.ttsFile; // Assuming your fetchRead returns an object with a ttsFile key.
            if (!ttsFile) throw new Error('Server returned no audio file URL.');

            // Check if the output URL is a full path or a relative path
           const fullAudioUrl = ttsFile.startsWith('http')
  ? ttsFile
  : `http://localhost:5000/${ttsFile}`;


            // Set the result to include an audio player
            setResult(`🗣️ **Audio Ready!**\n\n[Audio Player for ${filenameToSend} - ${voice}]\n\n<audio controls src="${fullAudioUrl}">Your browser does not support the audio element.</audio>`);

        } catch (err) {
            const errorStatus = err.response?.status;
            let errorMessage = `Error: Could not process reading request. Details: ${err.message}`;

            if (errorStatus === 403) {
                errorMessage = "❌ Please register or login first.";
            } else if (err.response?.data?.error) {
                errorMessage = `Error: ${err.response.data.error}`;
            }

            setResult(errorMessage);
        }

        setLoading(false);
    };

    // ============================================
    //  RENDER
    // ============================================

    if (pdfError) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
                <h1>PDF Loading Error</h1>
                <p>{pdfError}</p>
                <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px' }}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (!pdfSourceUrl) return <div>Initializing PDF Viewer...</div>;

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

              {/* <h2>Viewing Document: {cleanFilename}</h2> */}
            </div>

            {/* 3 Action Buttons — Analyze Removed */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginBottom: '30px'
                }}
            >

                {/* Translate */}
                <div>
                    <button
                        onClick={handleTranslate}
                        style={{
                            backgroundColor: '#1abc9c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '18px 0',
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}
                    >
                        🌍 Translate
                    </button>

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            marginTop: '8px',
                        }}
                    >
                        <option>English</option>
                        <option>Arabic</option>
                        <option>French</option>
                        <option>Spanish</option>
                        <option>German</option>
                    </select>
                </div>

                {/* Read */}
                <div>
                    <button
                        onClick={handleRead}
                        style={{
                            backgroundColor: '#e67e22',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '18px 0',
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}
                    >
                        🗣️ Read
                    </button>

                    <select
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            marginTop: '8px',
                        }}
                    >
                        <option>Female</option>
                        <option>Male</option>
                    </select>
                </div>

                {/* Summarize */}
                <div>
                    <button
                        onClick={handleSummarize}
                        style={{
                            backgroundColor: '#9b59b6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '18px 0',
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}
                    >
                        🧾 Summary 
                    </button>
                </div>

            </div>

            {/* PDF + Results */}
            <div style={{ display: 'flex', gap: '20px' }}>
                
                {/* PDF Viewer */}
                <div style={{
                    flex: 2,
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: '#f8f8f8',
                    overflow: 'hidden'

                }}>
                   {/* <p>Page {pageNumber} of {numPages || '...'}</p> */}
                    {/* <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}>Previous</button>
                    <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}>Next</button> */}

                    <div style={{ marginTop: '15px', overflow: 'auto' }}>
                        <embed 
                            src={pdfSourceUrl} 
                            type="application/pdf" 
                            width="100%" 
                            height="800px" 
                            style={{ border: 'none', overflow: 'hidden' }}
                        />
                    </div>
                </div>

                {/* AI Result */}
                <div style={{
                    flex: 1,
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '15px',
                    minHeight: '650px'
                }}>
                    <h3 style={{ textAlign: 'center' }}>{getResultHeading()}</h3>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'gray' }}>⏳ Processing...</p>
                    ) : result ? (
                        <div style={{
                            backgroundColor: '#ecf0f1',
                            padding: '15px',
                            borderRadius: '6px',
                            whiteSpace: 'pre-line',
                            overflowY: 'auto',
                            height: '500px'
                        }}>
                            {result}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                            Click Translate, Summarize, or Read.
                        </p>
                    )}
                </div>

            </div>

        </div>
    );
};

export default PDFViewPage;
