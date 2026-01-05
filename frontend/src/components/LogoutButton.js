// client/src/components/LogoutButton.js
import React from 'react';
import { useAuth } from '../contexts/UserContext'; 
const LogoutButton = () => {
    const { logout } = useAuth();
    const handleLogout = () => {
        logout(); 
    };
    return (
        <button 
            onClick={handleLogout} 
            style={{ marginLeft: '10px' }} 
        >
            Logout
        </button>
    );
};

export default LogoutButton;
