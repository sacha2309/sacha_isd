import React from 'react';
import PDFViewPage from '../pages/PDFViewPage.js'; 

const PDFModal = ({ filename, onClose }) => {
    
    // 🔑 CRITICAL FIX: Construct the full path using the backend's static route.
    // This assumes you set up 'app.use("/pdfs", ...)' in your server.js.
    const pdfUrl = '/pdfs/' + filename;

    return (
        // Modal Overlay
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflowY: 'auto',
            padding: '20px'
        }}>
            {/* Modal Content */}
            <div 
                id="pdf-viewer-content" // ID used by PDFViewPage for resize logic
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    width: '95%',
                    maxWidth: '1200px', 
                    margin: '20px 0',
                    position: 'relative'
                }}
            >
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    &times;
                </button>
                
                {/* 🔑 Pass the full URL to the viewer component */}
                <PDFViewPage filename={pdfUrl} />

            </div>
        </div>
    );
};

export default PDFModal;