const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


export const addFavorite = async (libraryId) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({ libraryId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add favorite');
    }

    return data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};


export const removeFavorite = async (libraryId) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites/${libraryId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove favorite');
    }

    return data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};


export const getUserFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get favorites');
    }

    return data;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};


export const checkIfFavorited = async (libraryId) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites/${libraryId}/check`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check favorite status');
    }

    return data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};


export const getFavoritesCount = async () => {
  try {
    const response = await fetch(`${API_URL}/api/favorites/count`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get favorites count');
    }

    return data;
  } catch (error) {
    console.error('Error getting favorites count:', error);
    throw error;
  }
};