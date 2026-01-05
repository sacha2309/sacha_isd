import React, { useState, useEffect } from 'react';
import PDFModal from '../components/PDFModal.jsx'; 

const HomePage = () => {
    const [pdfs, setPdfs] = useState([]);
    const [searchAI, setSearchAI] = useState('');
    const [sortByLanguage, setSortByLanguage] = useState('');
    const [sortByCountry, setSortByCountry] = useState('');
    const [selectedPdfFilename, setSelectedPdfFilename] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BACKEND_API_URL = `${process.env.REACT_APP_API_URL}/api/pdfs`;


    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                setLoading(true);
                setError(null);

             const response = await fetch(BACKEND_API_URL, {
    method: 'GET',
    headers: {
        Accept: 'application/json',
        // Include token if protected route
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
});


                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setPdfs(data);
            } catch (err) {
                console.error('❌ Failed to fetch PDFs:', err);
                
                setError(
                    `Failed to load documents: ${err.message}. Please ensure your backend server is running.`
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPdfs();
    }, []);

    // Extract unique languages and countries
    const allLanguages = [...new Set(pdfs.map((p) => p.language))];
    const allCountries = [...new Set(pdfs.map((p) => p.country))];

    // Filter PDFs based on search and filters
    const searchResults = pdfs.filter((pdf) => {
        const matchesSearch = pdf.title?.toLowerCase().includes(searchAI.toLowerCase());
        const matchesLanguage = sortByLanguage === '' || pdf.language === sortByLanguage;
        const matchesCountry = sortByCountry === '' || pdf.country === sortByCountry;
        return matchesSearch && matchesLanguage && matchesCountry;
    });

    // --- Conditional Rendering ---
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', color: '#3498db' }}>
                Loading documents...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#e74c3c', fontSize: '1.2em' }}>
                {error}
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="home-page" style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>POLYNEWS - Global News PDFs</h1>

            {/* Search */}
            <h2 style={{ marginBottom: '20px' , textAlign :'center'}}> PRESS ANY NEWS AND READ IT IN YOUR LANGUAGE  </h2>
            <input
                type="text"
                placeholder=" Search News..."
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
                  {allLanguages.map((lang, idx) => (
    <option key={lang ?? idx} value={lang}>
        {lang}
    </option>
))}

                    {/* {allLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))} */}
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
                    {allCountries.map((country, idx) => (
    <option key={country ?? idx} value={country}>
        {country}
    </option>
))}

                    {/* {allCountries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))} */}
                </select>
            </div>

            {/* PDF List */}
            <h2>{searchResults.length} Available Documents</h2>

            <div className="pdf-list-area" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {searchResults.length > 0 ? (
                    searchResults.map((pdf) => (
                        <div
                            key={pdf._id ?? pdf.filename}
                            className="pdf-item"
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
                            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{pdf.title}</h3>
                            {/* 🛠️ FIX: Use optional chaining and nullish coalescing (??) for fallback data */}
                            <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                Language: <b>{pdf.language ?? 'Unknown'}</b>
                            </p>
                            <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                Country: <b>{pdf.country ?? 'Global'}</b>
                            </p>
                            <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                Date: {pdf.date ?? 'N/A'}
                            </p>

                            <button
                                onClick={() => setSelectedPdfFilename(pdf.filename)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginTop: '15px',
                                    fontSize: '15px',
                                    transition: 'background-color 0.2s ease-in-out',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
                            >
                                View Document ➡️
                            </button>
                        </div>
                    ))
                ) : (
                    <h1 style={{ color: '#e74c3c', textAlign: 'center', width: '100%' }}>
                        No documents found matching your filters.
                    </h1>
                )}
            </div>

            {/* PDF Modal */}
            {selectedPdfFilename && (
                <PDFModal
                    filename={selectedPdfFilename}
                    onClose={() => setSelectedPdfFilename(null)}
                />
            )}
        </div>
    );
};

export default HomePage;