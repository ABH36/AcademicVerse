import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-white">Verifying Clearance...</div>;

  if (user && user.role === 'admin') {
    return children;
  }

  // If logged in but not admin, kick to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, kick to login
  return <Navigate to="/login" replace />;
};

export default AdminRoute;