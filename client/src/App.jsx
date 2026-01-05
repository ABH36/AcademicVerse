import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Ensure useAuth is exported
import ProtectedRoute from './components/ProtectedRoute'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard'; 
import PublicProfile from './pages/PublicProfile';
import LandingPage from './pages/LandingPage'; // --- NEW IMPORT ---

// --- PHASE-20: NEW IMPORTS ---
import TrustRegistry from './pages/public/TrustRegistry';
import LegalDocs from './pages/LegalDocs';

// --- HELPER: Home Route Logic ---
// Ye component decide karega ki Landing Page dikhana hai ya Dashboard
const HomeRoute = () => {
  const { user, loading } = useAuth();

  // Jab tak auth check ho raha hai, blank screen ya loader dikhao
  if (loading) return null; 

  // Agar user logged in hai, to Dashboard bhejo
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Agar naya user hai, to Landing Page dikhao
  return <LandingPage />;
};

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
          {/* --- ROOT ROUTE: SMART SWITCHING --- */}
          {/* Pehle ye Navigate to Login tha, ab ye Smart HomeRoute hai */}
          <Route path="/" element={<HomeRoute />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/u/:username" element={<PublicProfile />} />

          {/* PHASE-20: Public Trust Registry Route */}
          <Route path="/verify" element={<TrustRegistry />} />
          <Route path="/legal" element={<LegalDocs />} />

          {/* PROTECTED DASHBOARD ROUTE */}
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