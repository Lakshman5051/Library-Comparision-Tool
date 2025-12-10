import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './FavoritesView.css';
import { getUserFavorites, removeFavorite } from '../../Services/favoriteService';

/**
 * FavoritesView component displays all libraries favorited by the user.
 * Allows viewing and removing favorites.
 */
const FavoritesView = forwardRef(({ onViewDetails }, ref) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'alphabetical', 'popularity'

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching favorites...');

    try {
      const data = await getUserFavorites();

      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        throw new Error(data.message || 'Failed to fetch favorites');
      }
    } catch (err) {
      setError(err.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchFavorites
  }));

  const handleRemoveFavorite = async (libraryId, libraryName) => {
    if (!window.confirm(`Remove "${libraryName}" from your favorites?`)) {
      return;
    }

    try {
      const data = await removeFavorite(libraryId);

      if (data.success) {
        // Refresh the list after removal
        fetchFavorites();
      } else {
        throw new Error(data.message || 'Failed to remove favorite');
      }
    } catch (err) {
      alert(err.message || 'Failed to remove favorite');
    }
  };

  const getSortedFavorites = () => {
    const sortedFavorites = [...favorites];

    switch (sortBy) {
      case 'newest':
        return sortedFavorites.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'alphabetical':
        return sortedFavorites.sort((a, b) =>
          (a.library?.name || '').localeCompare(b.library?.name || '')
        );
      case 'popularity':
        return sortedFavorites.sort((a, b) =>
          (b.library?.githubStars || 0) - (a.library?.githubStars || 0)
        );
      default:
        return sortedFavorites;
    }
  };

  if (loading) {
    return (
      <div className="favorites-view">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-view">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchFavorites} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedFavorites = getSortedFavorites();

  return (
    <div className="favorites-view">
      <div className="favorites-header">
        <div className="favorites-header-content">
          <h2>My Favorite Libraries</h2>
          <span className="favorites-count">{favorites.length} {favorites.length === 1 ? 'library' : 'libraries'}</span>
        </div>

        {favorites.length > 0 && (
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="newest">Newest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>No Favorites Yet</h3>
          <p>Start exploring libraries and click the heart icon to add them to your favorites!</p>
        </div>
      ) : (
        <div className="favorites-tiles">
          {sortedFavorites.map((favorite) => {
            const lib = favorite.library;
            if (!lib) return null;

            const version = lib.latestVersion || lib.version || lib.versionNumber || 'N/A';
            const qualityGrade = lib.qualityGrade || lib.qualityGrade || 'N/A';
            const stars = lib.githubStars != null
              ? lib.githubStars.toLocaleString()
              : 'N/A';

            return (
              <div key={favorite.id} className="favorite-tile">
                <div className="favorite-tile-name">{lib.name || 'Unknown library'}</div>
                <div className="favorite-tile-meta">
                  <span className="meta-pill">v{version}</span>
                  <span className="meta-pill">{qualityGrade}</span>
                  <span className="meta-pill">⭐ {stars}</span>
                </div>
                {onViewDetails && (
                  <div className="favorite-tile-actions">
                    <button
                      className="favorite-view-btn"
                      onClick={(e) => { e.stopPropagation(); onViewDetails(lib, e); }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default FavoritesView;