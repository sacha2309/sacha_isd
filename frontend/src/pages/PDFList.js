// client/src/pages/PDFList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const PDFList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- New states for search inside PDFs ---
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResultsByText, setSearchResultsByText] = useState([]);

    // --- Fetch all PDFs from backend ---
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pdfs`);
                console.log("--- DATA RECEIVED FROM API ---");
                console.log(response.data); 
                console.log("----------------------------");
                setDocuments(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching document list:", err);
                setError("Failed to load documents. Check server terminal for errors.");
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // --- Function to search keyword inside PDFs ---
    const handleTextSearch = async () => {
        if (!searchKeyword) return;

        try {
            setLoading(true);
            setError(null);

            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/pdfs/search`, {
                keyword: searchKeyword
            });

            setSearchResultsByText(res.data); // backend should return array of PDFs with textSnippet
        } catch (err) {
            console.error('Error searching PDFs:', err);
            setError('Failed to search PDFs.');
        } finally {
            setLoading(false);
        }
    };

    // --- Loading & Error handling ---
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading documents...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    // --- Main Render ---
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Available Documents (Total: {documents.length})</h2>

            {/* --- Search inside PDFs --- */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder="Search inside PDFs..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ padding: '10px', width: '60%', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px' }}
                />
                <button
                    onClick={handleTextSearch}
                    style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Search
                </button>
            </div>

            {/* --- Display search results if any --- */}
            {searchResultsByText.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h3>Search Results ({searchResultsByText.length})</h3>
                    {searchResultsByText.map(pdf => (
                        <div key={pdf.filename} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                            <h4>{pdf.filename}</h4>
                            <p>{pdf.textSnippet}...</p>
                            <Link 
                                to={`/view-pdf/${pdf.filename}`} 
                                style={{ color: 'white', backgroundColor: '#2ecc71', padding: '5px 10px', borderRadius: '5px', textDecoration: 'none' }}
                            >
                                View PDF
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Original PDF List --- */}
            <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                {documents.map(doc => {
                    const fileNameToUse = doc.filename || ''; 
                    const linkPath = `/view-pdf/${fileNameToUse}`;
                    const isLinkValid = fileNameToUse.trim() !== '';

                    return (
                        <div 
                            key={doc._id} 
                            style={{ 
                                border: '1px solid #ccc', 
                                padding: '15px', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{doc.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.9em', color: '#7f8c8d' }}>
                                    Date: {doc.date} | Filename: {fileNameToUse || 'MISSING'}
                                </p>
                            </div>

                            {isLinkValid ? (
                                <Link 
                                    to={linkPath}
                                    style={{ 
                                        padding: '10px 15px', 
                                        backgroundColor: '#2ecc71', 
                                        color: 'white', 
                                        textDecoration: 'none',
                                        borderRadius: '5px'
                                    }}
                                >
                                    View PDF
                                </Link>
                            ) : (
                                <span style={{ color: 'red' }}>Filename Missing!</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PDFList;
