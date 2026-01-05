// client/src/pages/DocumentList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                // Fetch the list from the Express backend
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pdfs`);

                
                // 🔑 CRITICAL DEBUG STEP: Log the incoming data structure!
                // Inspect your browser console (F12) for this output.
                console.log("--- DATA RECEIVED FROM API ---");
                console.log(response.data); 
                console.log("----------------------------");
                
                setDocuments(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching document list:", err);
                // If the error status is 500, it means the server crashed.
                setError("Failed to load documents. Check server terminal for errors.");
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading documents...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }
    
    // --- Render ---

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Available Documents (Total: {documents.length})</h2>
            <p>If links fail, check the browser console for the correct filename property name.</p>
            
            <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                {documents.map(doc => {
                    
                    // Fallback to empty string if doc.filename is null/undefined
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
                            {/* Document Title and Info */}
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{doc.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.9em', color: '#7f8c8d' }}>
                                    Date: {doc.date} | Filename: {fileNameToUse || 'MISSING'}
                                </p>
                            </div>
                            
                            {/* Navigation Button */}
                            {isLinkValid ? (
                                <Link 
                                    to={linkPath} // e.g., /view-pdf/1.pdf
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

export default DocumentList;