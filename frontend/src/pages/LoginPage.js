// client/src/pages/LoginPage.js - FINAL FIXED VERSION

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Import the custom hook for global authentication state
import { useAuth } from '../contexts/UserContext.js'; 
// Use NAMED IMPORT to match the likely export structure
import { ReturnButton } from '../components/ReturnButton.js'; 

// FINAL FIX: Correct port 5000 for backend
const API_URL = `${process.env.REACT_APP_API_URL}/api`;


export default function LoginPage() {
    const navigate = useNavigate();
    
    // Use the global authentication state (isAuthenticated) and action (login)
    const { isAuthenticated, login } = useAuth(); 
    
    // ✅ FIX 1: Change formData state from 'name' to 'email' to match the back-end
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    // ===================================================
    // REDIRECT ON AUTHENTICATION CHECK
    // ===================================================
    useEffect(() => {
        // If the global state confirms the user is authenticated, redirect them away
        if (isAuthenticated) {
            navigate('/', { replace: true }); 
        }
    }, [isAuthenticated, navigate]); 
    // ===================================================

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Logging in...');
        try {
            // FINAL FIX: Correct endpoint to /api/auth/login
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
            
            const token = response.data.token;
            const user = response.data.user; 
            
            // CALL THE GLOBAL LOGIN FUNCTION (This correctly passes the 'user' object)
            login(token, user); 
            
            setMessage(response.data.message || 'Login successful!');
            
            // Successful login: Redirect to dashboard after a short delay
            // If you have a '/dashboard' route defined
            setTimeout(() => navigate('/dashboard', { replace: true }), 1000); 

        } catch (error) {
            // Handle HTTP error response
            // This catches the original "Login failed. Check server connection." error
            setMessage(error.response?.data?.message || 'Login failed. Check server connection.');
            console.error('Login error:', error.response?.data || error);
        }
    };

    return (
        <div className="login-page-container" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'flex-start',
            minHeight: 'calc(100vh - 70px)', 
            padding: '100px 20px 40px', 
            backgroundColor: '#f4f7f9' 
        }}>
            
            <div className="form-box" style={{ 
                backgroundColor: 'white', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 10px 30px rgba(60, 168, 75, 0.8)', 
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h2 style={{color: '#2c3e50', marginBottom: '30px', fontWeight: '600'}}>Login to POLYNEWS</h2>
                
                {message && 
                    <p style={{ 
                        color: message.includes('successful') ? '#27ae60' : '#e74c3c', 
                        marginBottom: '20px',
                        fontSize: '0.95rem'
                    }}>
                        {message}
                    </p>
                }

                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        // ✅ FIX 2: Input name is changed to 'email' to match back-end
                        name="email" 
                        placeholder="Email Address" // Updated placeholder for clarity
                        onChange={handleChange} 
                        required 
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            marginBottom: '15px', 
                            border: '1px solid #e0e6ed', 
                            borderRadius: '8px', 
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        required 
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            marginBottom: '30px', 
                            border: '1px solid #e0e6ed', 
                            borderRadius: '8px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button 
                        type="submit" 
                        className="primary-login-button" 
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            backgroundColor: '#3498db', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Sign In
                    </button>
                </form>
            </div>

            {/* Back to Home Button remains below the form */}
            <ReturnButton style={{ marginTop: '30px' }} />

        </div>
    );
}