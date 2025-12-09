/**
 * API Configuration
 *
 * In development: Uses proxy configured in package.json (http://localhost:8080)
 * In production: Uses environment variable or defaults to same-origin requests
 */

// For development with proxy: use empty string (relative URLs)
// For production: use environment variable if set, otherwise empty string (same-origin)
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Get full API URL
 * @param {string} endpoint - API endpoint path (e.g., '/api/auth/login')
 * @returns {string} - Full URL or relative path
 */
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If API_BASE_URL is empty, return relative path (for proxy or same-origin)
  // Otherwise, concatenate base URL with endpoint
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};