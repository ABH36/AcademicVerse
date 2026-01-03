import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Phase-8 UX: Replace with a Skeleton Loader or Spinner later
    return <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  // 1. Not Logged In -> Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check (Optional)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Unauthorized for this role
  }

  // 3. Authorized
  return children;
};

export default ProtectedRoute;