/**
 * API Client with automatic session validation
 *
 * This module provides a fetch wrapper that automatically handles session validation
 * and redirects to login if session is expired.
 */

// Use relative URLs to work with proxy (package.json proxy: http://localhost:8080)
const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Enhanced fetch that includes credentials and handles session expiration
 */
export const authenticatedFetch = async (url, options = {}) => {
  // Ensure credentials are included for session cookies
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Major fix here:
  // This ensures relative URLs like '/api/projects' get the correct base URL
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  try {
    const response = await fetch(fullUrl, fetchOptions);

    // If we get 401 Unauthorized, session has expired
    if (response.status === 401) {
      console.warn('Session expired - redirecting to login');

      // Clear any local state
      localStorage.removeItem('isLoggedIn');

      // Reload the page to trigger App.js session restoration
      // which will show login page since session is invalid
      window.location.reload();

      // Return a rejected promise to prevent further processing
      return Promise.reject(new Error('Session expired'));
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Check if user is currently authenticated
 */
export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return response.ok && data.authenticated;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

/**
 * Get current user details
 */
export const getCurrentUser = async () => {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data.success ? data : null;
    }
    return null;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};

export default {
  authenticatedFetch,
  checkAuthStatus,
  getCurrentUser,
};