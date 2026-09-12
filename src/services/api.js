import axios from 'axios';

/**
 * Axios API Instance — Foundation
 *
 * Base URL is read from the VITE_API_BASE_URL environment variable.
 * Falls back to the local development server when the variable is absent.
 *
 * Do NOT hard-code a production URL here.
 * Set VITE_API_BASE_URL in your .env file (see .env.example).
 */
const isProd = import.meta.env.PROD;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (isProd ? '/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
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
    // Log to console only during development
    if (import.meta.env.DEV) {
      console.error('[API Error]', error?.response?.data || error.message);
    }

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
