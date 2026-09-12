/**
 * Application-wide constants
 *
 * Keep magic strings, numbers, and configuration keys in one place.
 * Feature-specific constants should live in their own files within
 * this directory (e.g., routes.js, api.js).
 */

/** Local-storage key for the JWT auth token */
export const AUTH_TOKEN_KEY = 'authToken';

/** Supported theme options (will be used by the theme slice) */
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

/** Application display name */
export const APP_NAME = 'Portfolio';
