import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🔑 Component name matches file name and export name
const ReturnButton = ({ style = {} }) => {
    // ✅ Fix: Call the useNavigate hook inside the component function
    const navigate = useNavigate();

    const defaultStyle = {
        padding: '10px 15px',
        backgroundColor: '#2c3e50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background-color 0.2s',
        ...style,
    };

    return (
        <button 
            onClick={() => navigate('/')} 
            style={defaultStyle}
        >
            ⬅️ Back to Home Page
        </button>
    );
};

// ✅ Fix: Clean NAMED EXPORT to match the import { ReturnButton } in LoginPage.js
export { ReturnButton };