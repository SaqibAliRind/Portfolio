import axios from 'axios';
import { getAdminToken, removeAdminToken } from '../utils/authStorage';

/**
 * Axios API Instance
 *
 * Always uses relative '/api' path.
 * - Production (Vercel): routes to serverless function at same domain.
 * - Development: Vite proxy forwards '/api' → 'http://localhost:5000/api'.
 *   (See vite.config.js server.proxy)
 *
 * This avoids any dependency on environment variables being correctly set.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error?.response?.data || error.message);

    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        removeAdminToken();
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
