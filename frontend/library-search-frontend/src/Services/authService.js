const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
    return data.authenticated;
  } catch (error) {
    console.error('Check authentication error:', error);
    return false;
  }
};
