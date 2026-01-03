import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Session Bootstrap (Hydration)
  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get('accessToken');
      if (!token) {
        // Try refreshing silently
        try {
            const { data } = await api.get('/auth/refresh');
            // SECURITY PATCH 1: Strict 15 min expiry
            Cookies.set('accessToken', data.accessToken, { 
                secure: true, 
                sameSite: 'strict', 
                expires: 0.0104 
            });
            // Token refreshed, now fetch profile
            await fetchProfile();
        } catch (err) {
            setLoading(false); // No session
        }
        return;
      }
      
      // We have a token, verify and fetch user
      await fetchProfile();
    };

    loadUser();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/me');
      
      setUser({
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.avatar,
        username: data.user.username
      });
    } catch (error) {
      console.error("Profile Fetch Failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 2. Register Action
  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      
      // Auto-Login Logic
      Cookies.set('accessToken', data.accessToken, { 
          secure: true, 
          sameSite: 'strict', 
          expires: 0.0104 
      });
      
      setUser(data);
      // await fetchProfile(); // Optional: Fetch full profile if needed
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // 3. Login Action
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // SECURITY PATCH 1: Strict 15 min expiry
      Cookies.set('accessToken', data.accessToken, { 
          secure: true, 
          sameSite: 'strict', 
          expires: 0.0104 
      });
      
      setUser(data.user);
      await fetchProfile(); // Get full details
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // 4. Logout Action
  const logout = async () => {
    try {
      await api.post('/auth/logout'); // Clear Server Cookie
    } catch (err) {
      // Ignore error
    }
    Cookies.remove('accessToken'); // Clear Client Cookie
    setUser(null);
    window.location.href = '/login';
  };

  // --- NEW: Phase-19B Get Login History ---
  const getLoginHistory = async () => {
    try {
      const { data } = await api.get('/auth/history');
      return data;
    } catch (error) {
      console.error("Failed to fetch login history", error);
      return []; // Return empty array on error to prevent crash
    }
  };

  // SINGLE VALUE OBJECT (Corrected)
  const value = {
    user,
    loading,
    login,
    register, 
    logout,
    getLoginHistory, // <--- EXPORTED NEW FUNCTION
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};