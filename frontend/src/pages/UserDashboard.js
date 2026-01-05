import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext'; 

const UserDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for search and filtering
    const [searchAI, setSearchAI] = useState('');
    const [sortByLanguage, setSortByLanguage] = useState('');
    const [sortByCountry, setSortByCountry] = useState('');

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Function to handle viewing the PDF
  const handleViewPDF = (filename) => {
    const finalFilename = (filename || '').trim();

    if (!finalFilename) {
        console.error("Attempted to open PDF with empty filename.");
        return;
    }

    navigate(`/view-pdf/${encodeURIComponent(finalFilename)}`);
};

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login'); 
            return;
        }

        const fetchDocuments = async () => {
            try {
                // Fetch documents from the protected API endpoint
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pdfs`);

                setDocuments(response.data);
            } catch (err) {
                console.error("Error fetching protected document list:", err);
                setError("Failed to load documents. Check server, network, and token authorization."); 
            } finally {
                setLoading(false); 
            }
        };

        fetchDocuments();
    }, [isAuthenticated, navigate]);


    // Logic to extract unique languages and countries for dropdowns
    const allLanguages = [...new Set(documents.map((p) => p.language).filter(Boolean))];
    const allCountries = [...new Set(documents.map((p) => p.country).filter(Boolean))];

    // Filter PDFs based on current search and sort states
    const searchResults = documents.filter((pdf) => {
        const matchesSearch = pdf.title?.toLowerCase().includes(searchAI.toLowerCase());
        const matchesLanguage = sortByLanguage === '' || pdf.language === sortByLanguage;
        const matchesCountry = sortByCountry === '' || pdf.country === sortByCountry;
        return matchesSearch && matchesLanguage && matchesCountry;
    });


    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Protected Dashboard...</div>;
    }

    if (error) {
        return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }
    
    return (
        <div 
            className="user-dashboard-layout" 
            style={{ padding: '20px', margin: '20px auto' }}
        >
            <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>POLYNEWS - Global News PDFs</h1>
 <h2 style={{ marginBottom: '20px' , textAlign :'center'}}> PRESS ANY NEWS AND READ IT IN YOUR LANGUAGE  </h2>
            {/* Ask AI / Search NEWS Input */}
           
            <input
                type="text"
                placeholder="Search News..."
                value={searchAI}
                onChange={(e) => setSearchAI(e.target.value)}
                style={{
                    margin: '10px 0 20px',
                    padding: '12px',
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: '8px',
                    border: '2px solid rgba(0, 38, 255, 1)',
                    fontSize: '16px',
                }}
            />

            {/* Sorting Options */}
            <div
                className="sort-options"
                style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}
            >
                <select
                    value={sortByLanguage}
                    onChange={(e) => setSortByLanguage(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        minWidth: '180px',
                    }}
                >
                    <option value="">Sort by Language (All)</option>
                    {allLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>

                <select
                    value={sortByCountry}
                    onChange={(e) => setSortByCountry(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        minWidth: '180px',
                    }}
                >
                    <option value="">Sort by Country (All)</option>
                    {allCountries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Document List (Grid/Card Layout) */}
            <h2 style={{ marginTop: '20px' }}>{searchResults.length} Available Documents</h2>

            <div 
                className="pdf-list-area" 
                style={{ 
                    display: 'flex', 
                    gap: '30px', 
                    flexWrap: 'wrap',
                    marginTop: '30px'
                }}
            >
                {searchResults.length > 0 ? (
                    searchResults.map(doc => {
                        
                        const fileNameToLink = doc.filename || ''; 
                        const isLinkValid = fileNameToLink.trim().length > 0;

                        if (!isLinkValid) {
                            return (
                                <div key={doc._id || Math.random()} style={{ color: 'red', padding: '10px' }}>
                                    Data Error: Filename missing for "{doc.title || 'Untitled'}".
                                </div>
                            );
                        }
                        
                        return (
                            <div
                                key={doc._id}
                                className="pdf-item-card"
                                style={{
                                    border: '1px solid #bdc3c7',
                                    padding: '20px',
                                    width: '280px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 5px #9dcbfaff', 
                                    backgroundColor: '#fff',
                                    transition: 'transform 0.2s ease-in-out',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {/* Document Title (Right-to-Left for Arabic titles) */}
                                <h3 style={{ marginTop: 0, color: '#2c3e50', direction: 'rtl' }}>
                                    {doc.title}
                                </h3>
                                
                                {/* Language, Country, and Date fields with fallbacks */}
                                <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Language: <b>{doc.language ?? 'Unknown'}</b>
                                </p>
                                <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Country: <b>{doc.country ?? 'Global'}</b>
                                </p>
                                <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    Date: {doc.date ?? 'N/A'}
                                </p>

                                {/* Button area */}
                                <button 
                                    onClick={() => handleViewPDF(fileNameToLink)}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#3498db', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        marginTop: '15px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease-in-out', 
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
                                    disabled={!isLinkValid}
                                >
                                    View Document ➡️
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <h1 style={{ color: '#e74c3c', textAlign: 'center', width: '100%' }}>
                        No documents found matching your filters.
                    </h1>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;