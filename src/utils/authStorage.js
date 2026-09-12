/**
 * authStorage.js
 *
 * Centralized localStorage utility for admin authentication.
 * All token read/write/delete operations go through here.
 *
 * Security rules:
 *  - Only the JWT string is stored — never the password, hash, or secret.
 *  - One consistent key is used throughout the application.
 *  - Reads return null safely if nothing is stored.
 */

const TOKEN_KEY = 'portfolio-admin-token';

/**
 * Read the admin JWT from localStorage.
 * Returns null if nothing is stored.
 * @returns {string|null}
 */
export const getAdminToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Persist the admin JWT to localStorage.
 * @param {string} token
 */
export const setAdminToken = (token) => {
  try {
    if (token && typeof token === 'string') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Silently fail — storage may be unavailable (private browsing, etc.)
  }
};

/**
 * Remove the admin JWT from localStorage (logout / token invalidation).
 */
export const removeAdminToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Silently fail
  }
};

export default { getAdminToken, setAdminToken, removeAdminToken };
