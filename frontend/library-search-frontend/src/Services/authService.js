// Use relative URLs to work with proxy (package.json proxy: http://localhost:8080)
const API_URL = process.env.REACT_APP_API_URL || '';

export const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: Include cookies for session
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 * @returns {Promise} - User data if authenticated
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include session cookie
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return data.success ? data : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};


export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include session cookie
    });

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};


export const checkAuthentication = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    console.log('=== FRONTEND: checkAuthentication response ===');
    console.log('Status:', response.status);
    console.log('Response data:', data);
    console.log('Authenticated:', data.authenticated);
    
    if (data.message) {
      console.warn('Auth check message:', data.message);
    }
    
    return data.authenticated === true;
  } catch (error) {
    console.error('Check authentication error:', error);
    return false;
  }
};

/**
 * Login with email and password
 * @param {object} loginData - { email, password }
 * @returns {Promise} - User data if login successful
 */
export const login = async (loginData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Signup new user with email and password
 * @param {object} signupData - { firstName, lastName, email, password }
 * @returns {Promise} - User data if signup successful
 */
export const signup = async (signupData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auto-login after signup
      body: JSON.stringify(signupData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
