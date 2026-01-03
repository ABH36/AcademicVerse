import axios from 'axios';
import Cookies from 'js-cookie';

// PHASE-10: Dynamic Base URL Logic
// In Development: Uses Vite Proxy ('/api' -> localhost:5000)
// In Production: Uses VITE_API_URL (https://academicverse-backend.onrender.com/api)
const BASE_URL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL 
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Vital: Sends HttpOnly Cookies to Backend
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// PHASE-8A SECURITY: Refresh Loop Kill-Switch
let isRefreshing = false;

// Response Interceptor: Handle 401 (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized AND not a retry AND not already refreshing
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt Refresh (Backend uses HttpOnly cookie to verify)
        // Note: We use 'api.get' but we must ensure we don't loop. 
        // Since this is a new request, we create a temporary instance or ensure 
        // the refresh endpoint itself doesn't trigger this interceptor loop.
        // Simple fix: The refresh endpoint is public/cookie-based, so 401 there 
        // usually means "Game Over" anyway.
        
        const { data } = await axios.get(`${BASE_URL}/auth/refresh`, { 
            withCredentials: true 
        });
        
        // SECURITY PATCH: Strict Token Lifetime (0.0104 days = ~15 mins)
        Cookies.set('accessToken', data.accessToken, { 
            secure: true, 
            sameSite: 'strict', 
            expires: 0.0104 
        });
        
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed (Session fully expired or invalid)
        isRefreshing = false;
        Cookies.remove('accessToken');
        
        // Force clean redirect to login
        // We use window.location to ensure a full state flush
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;