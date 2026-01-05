// client/src/components/ProtectedRoute.js - TEMPORARY DEBUGGING CHANGE

import React from 'react';
import { useAuth } from '../contexts/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />; 
    }

    // 3. Render the child route (UserDashboard).
    return <Outlet />;
};

export default ProtectedRoute;