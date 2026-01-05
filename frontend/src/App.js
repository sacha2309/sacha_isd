// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; 

import { AuthProvider } from './contexts/UserContext'; 
import ProtectedRoute from './components/ProtectedRoute'; 

import Header from './components/Header'; 
import Footer from './components/Footer'; 
import HomePage from './pages/HomePage'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import PDFViewPage from './pages/PDFViewPage'; 
// ✅ FIX 1: Rename the import to match the component name used in the JSX below
// The file is imported as 'UserDashboard' but used as 'DashboardPage'
import DashboardPage from './pages/UserDashboard'; 

// Placeholder pages (kept for completeness)
const AboutPage = () => <h1>About Us</h1>;
const ContactPage = () => <h1>Contact Us</h1>;


function App() {
    return (
        <Router>
            <AuthProvider> 
                
                <Header /> 
                
                <main style={{ paddingTop: '70px', minHeight: '100vh', flexGrow: 1 }}>
                    <Routes>
                        {/* 🔓 PUBLIC ROUTES */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        {/* New Header Button Routes */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />


                        {/* 🔒 PROTECTED ROUTES: Wrapped by the component check */}
                        <Route element={<ProtectedRoute />}>
                            
                            {/* ✅ FIX 2: Move the main dashboard route INSIDE ProtectedRoute */}
                            {/* This ensures only logged-in users can access the document list */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            
                            {/* Static PDF Route (can be removed if not needed) */}
                           // <Route path="/view-pdf-static" element={<PDFViewPage />} />
                            
                            {/* Dynamic PDF Viewer Route (Protected) */}
                            <Route path="/view-pdf/:filename" element={<PDFViewPage />} /> 
                            
                        </Route>

                        {/* ⚠️ Fallback route: Keep only if you want an explicit 404 handler, but remove the duplicate /dashboard */}
                        {/* If you add a generic catch-all here, it should be the last route: 
                        <Route path="*" element={<h1>404: Page Not Found</h1>} /> */}
                        
                    </Routes>
                </main>
                
                <Footer />
                
            </AuthProvider>
        </Router>
    );
}

export default App;