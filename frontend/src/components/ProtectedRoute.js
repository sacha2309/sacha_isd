// client/src/components/ProtectedRoute.js

import React from 'react';
import { useAuth } from '../contexts/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    // إذا لم يكن مسجل الدخول → أرسل المستخدم إلى الصفحة الرئيسية
    if (!isAuthenticated) {
        return <Navigate to="/" replace />; 
    }

    // إذا كان مسجل الدخول → اعرض المحتوى المحمي
    return <Outlet />;
};

export default ProtectedRoute;
