import axios from 'axios';

/**
 * Axios API Instance — Foundation
 *
 * In PRODUCTION (Vercel): Always use relative '/api' so requests go to
 * the same domain's serverless functions — no CORS, no localhost issues.
 *
 * In DEVELOPMENT: Use VITE_API_BASE_URL env var, or fall back to localhost.
 */
const getBaseURL = () => {
  // Production: always use relative path (Vercel serverless)
  if (import.meta.env.PROD) return '/api';
  // Development: use .env override or localhost default
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

import { getAdminToken } from '../utils/authStorage';

/**
 * Request interceptor
 * Attach the JWT token from localStorage (when available) to every request.
 */
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

import { removeAdminToken } from '../utils/authStorage';

/**
 * Response interceptor
 * Centralised error handling — extend as needed in future tasks.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Always log errors to help debug
    console.error('[API Error]', error?.response?.data || error.message);

    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Prevent redirecting if the 401 was actually from the login endpoint itself
      const isLoginRequest = error.config.url === '/auth/login';
      
      if (!isLoginRequest) {
        removeAdminToken();
        // Redirect to login (avoiding circular dependency with Redux store)
        // Only redirect if not already there
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
