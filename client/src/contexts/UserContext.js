// client/src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// 1️⃣ Custom hook to consume the context
export const useAuth = () => useContext(AuthContext);

// 2️⃣ AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // hold render until auth checked
  const [authToken, setAuthToken] = useState(null);

  // Proxy-friendly API URL (works with client/package.json proxy)
  const API_URL = '/api';

  // ===================================================
  // AUTH LOGIC FUNCTIONS
  // ===================================================

  const login = (token, userData) => {
    // 1️⃣ Store token & user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2️⃣ Set Axios default Authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 3️⃣ Update state
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // 1️⃣ Clear token & user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2️⃣ Remove Axios header
    delete axios.defaults.headers.common['Authorization'];

    // 3️⃣ Reset state
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // ===================================================
  // EFFECT: Check auth status on mount
  // ===================================================
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token) {
        // 1️⃣ Set Axios header immediately
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // 2️⃣ Verify token with backend
          const response = await axios.get(`${API_URL}/auth/verify`);

          // 3️⃣ Token valid, update state
          setAuthToken(token);
          setIsAuthenticated(true);

          const userData = storedUser
            ? JSON.parse(storedUser)
            : response.data.user || {
                firstName: response.data.firstName || 'User',
                lastName: response.data.lastName || '',
                fullName: response.data.name || 'User',
                id: response.data.id || 'N/A',
              };

          setUser(userData);
        } catch (error) {
          console.log('Token verification failed, clearing auth state');

          // Token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];

          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================
  const value = {
    isAuthenticated,
    user,
    loading,
    authToken,
    login,
    logout,
  };

  // Show loading screen while checking token
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          color: '#3498db',
        }}
      >
        Loading authentication status...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
