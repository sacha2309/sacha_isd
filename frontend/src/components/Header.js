// Header.js - Final Version with improved spacing and structure

import React from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext.js';

const Header = () => {
    const navigate = useNavigate();
    // Destructure user details and authentication functions
    const { isAuthenticated, user, logout } = useAuth(); 
    
    // Define constant padding for consistency
    const headerPadding = '10px';
    
    // Define STATIC styles for a permanent solid header
    const headerStyle = {
        backgroundColor: '#030f57ff', 
        color: 'white', 
        borderTop: '5px solid #ffffffff', 
        boxShadow: '0 2px 4px rgba(255, 182, 255, 1)',

        // Fixed position properties
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        
        // Layout properties
        display: 'flex',
        justifyContent: 'space-between', // Pushes Logo (Left), Welcome (Center), Buttons (Right)
        alignItems: 'center',
        
        // Use inline padding to manage vertical space
        padding: '15px 0', 
        height: '70px', 
    };

    const logoTextStyle = {
        color: 'white', 
        textDecoration: 'none', 
        fontSize: '28px', 
        fontWeight: 'bold',
        marginLeft: headerPadding, // ⬅️ ADDED LEFT MARGIN
        flexShrink: 0, 
    };
    
    const buttonStyle = {
        backgroundColor: '#9dcbfaff', 
        color: 'white',
        border: '1px solid white',
        borderRadius: '5px',
        padding: '10px 15px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        whiteSpace: 'nowrap',
    };
    
    // NEW STYLE for the welcome text container
    const welcomeContainerStyle = {
        flexGrow: 1, // Takes up remaining space for centering
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
    };

    // Style for the welcome text itself (centered within its container)
    const welcomeTextStyle = {
        fontWeight: '600',
        fontSize: '18px',
        whiteSpace: 'nowrap',
    };

    return (
        <header style={headerStyle}>
            
            {/* 1. Logo/Title on the Far Left */}
            <div className="logo">
                <Link to="/" style={logoTextStyle}>
                    POLYNEWS
                </Link>
            </div>
            
            {/* 2. Welcome/Middle Area (Takes up max space to center text) */}
            <div className="center-area" style={welcomeContainerStyle}>
                {isAuthenticated && user && (
                    <span style={welcomeTextStyle}>
                        Welcome, {user.firstName}!
                    </span>
                )}
            </div>

            {/* 3. Navigation/Logout Buttons on the Far Right */}
            <div 
                className="nav-area" 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginRight: headerPadding // ⬅️ ADDED RIGHT MARGIN
                }}
            >
                
                {isAuthenticated && user ? (
                    // Logged In View: Only show Logout button on the far right
                    <button 
                        onClick={logout}
                        style={buttonStyle}
                    >
                        Logout
                    </button>
                ) : (
                    // Logged Out View: Show Login/Register buttons
                    <div className="nav-buttons" style={{ display: 'flex' }}>
                        <button 
                            onClick={() => navigate('/login')} 
                            style={{ ...buttonStyle, marginRight: '10px' }} 
                        >
                            Login
                        </button>
                        
                        <button 
                            onClick={() => navigate('/register')} 
                            style={buttonStyle}
                        >
                            Register
                        </button>
                    </div>
                )}
                
            </div>
        </header>
    );
};

export default Header;