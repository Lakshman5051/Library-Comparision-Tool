/**
 * Session utility functions to handle authentication state properly
 */

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Wait for session to be fully established after login
 * This prevents race conditions where components try to access authenticated endpoints
 * before the session is persisted to the database
 *
 * @param {number} maxAttempts - Maximum number of verification attempts
 * @param {number} delayMs - Delay between attempts in milliseconds
 * @returns {Promise<boolean>} - True if session is ready, false otherwise
 */
export const waitForSessionReady = async (maxAttempts = 5, delayMs = 300) => {
  console.log('🔄 Waiting for session to be ready...');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}/api/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.authenticated === true && data.hasUserId === true) {
        console.log(`✅ Session ready after ${attempt} attempts`);
        return true;
      }

      console.log(`⏳ Attempt ${attempt}/${maxAttempts}: Session not ready yet`, data);

      // Wait before next attempt (except on last attempt)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Session check attempt ${attempt} failed:`, error);

      // Wait before retry (except on last attempt)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  console.warn('⚠️  Session not ready after maximum attempts');
  return false;
};

/**
 * Check if user is currently authenticated
 * This is a simple, non-retrying check
 *
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return response.ok && data.authenticated === true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};