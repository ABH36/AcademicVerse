import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Your existing file is perfect
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard'; // Handles all sub-routes including /admin
import PublicProfile from './pages/PublicProfile';

// --- PHASE-20: NEW IMPORT ---
import TrustRegistry from './pages/public/TrustRegistry';
import LegalDocs from './pages/LegalDocs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          theme="dark"
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/u/:username" element={<PublicProfile />} />

          {/* PHASE-20: Public Trust Registry Route */}
          <Route path="/verify" element={<TrustRegistry />} />
          <Route path="/legal" element={<LegalDocs />} />

          {/* PROTECTED DASHBOARD ROUTE
            Note: The Admin Panel is now nested inside Dashboard as /dashboard/admin
            This ensures the Sidebar and Header remain consistent.
          */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;