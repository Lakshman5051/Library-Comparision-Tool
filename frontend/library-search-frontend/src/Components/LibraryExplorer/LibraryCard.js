import React, { useState, useEffect } from 'react';
import AddToProjectModal from '../ProjectWorkspace/AddToProjectModal';
import { addFavorite, removeFavorite, checkIfFavorited } from '../../Services/favoriteService';

function formatStars(stars) {
  if (!stars && stars !== 0) return 'N/A';
  if (stars >= 1_000_000) return `${(stars / 1_000_000).toFixed(1)}M`;
  if (stars >= 1_000) return `${(stars / 1_000).toFixed(1)}k`;
  return stars.toString();
}

function LibraryCard({ library, isFavorited: initialIsFavorited = null, onFavoriteChange }) {
  const [showAddToProject, setShowAddToProject] = useState(false);
  const [showAddToNewProject, setShowAddToNewProject] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Check favorite status on mount if not provided
  useEffect(() => {
    if (initialIsFavorited === null && library.id) {
      checkIfFavorited(library.id)
        .then((data) => {
          if (data.success) {
            setIsFavorited(data.isFavorited);
          }
        })
        .catch((err) => {
          console.error('Error checking favorite status:', err);
        });
    }
  }, [library.id, initialIsFavorited]);

  const handleAddSuccess = (projectId) => {
    alert(`Successfully added "${library.name}" to project!`);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    setFavoriteLoading(true);

    try {
      if (isFavorited) {
        const data = await removeFavorite(library.id);
        if (data.success) {
          setIsFavorited(false);
          if (onFavoriteChange) onFavoriteChange(library.id, false);
        }
      } else {
        const data = await addFavorite(library.id);
        if (data.success) {
          setIsFavorited(true);
          if (onFavoriteChange) onFavoriteChange(library.id, true);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="library-card">
      {/* Header Section */}
      <div className="library-card-header">
        <div className="library-card-title-row">
          <div className="library-card-title-large">{library.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {library.latestVersion && (
              <span className="library-card-version-badge">v{library.latestVersion}</span>
            )}
            <button
              className={`favorite-button ${isFavorited ? 'favorited' : ''} ${favoriteLoading ? 'loading' : ''}`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                background: 'none',
                border: 'none',
                cursor: favoriteLoading ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
                opacity: favoriteLoading ? 0.5 : 1
              }}
            >
              {favoriteLoading ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavorited ? '#e74c3c' : 'none'}
                  stroke={isFavorited ? '#e74c3c' : '#999'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transition: 'all 0.2s ease'
                  }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
          </div>
        </div>
              {/* ...existing code for meta, description, attributes, etc... */}
              {/* Action Buttons at the bottom */}
              <div className="library-card-actions" style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                <button
                  className="view-details-btn"
                  type="button"
                  onClick={() => {
                    if (library.onClick) library.onClick();
                  }}
                >
                  View Details
                </button>
                <div className="add-to-project-dropdown" style={{ position: 'relative' }}>
                  <button
                    className="add-to-project-btn"
                    onClick={() => setDropdownOpen((open) => !open)}
                    title="Add this library to a project"
                  >
                    + Add to Project
                  </button>
                  {dropdownOpen && (
                    <div className="add-to-project-menu" style={{ position: 'absolute', left: 0, top: '100%', zIndex: 10, background: '#fff', border: '1px solid #eee', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <button className="add-to-project-menu-item" onClick={() => { setShowAddToNewProject(true); setDropdownOpen(false); }}>Add to New Project</button>
                      <button className="add-to-project-menu-item" onClick={() => { setShowAddToProject(true); setDropdownOpen(false); }}>Add to Existing Project</button>
                    </div>
                  )}
                </div>
              </div>
        <div className="library-card-meta-row">
          {library.lastRegistryReleaseDate && (
            <span className="library-card-updated">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Updated on {library.lastRegistryReleaseDate}
            </span>
          )}
          {library.githubStars && (
            <>
              <span className="library-card-meta-separator">•</span>
              <span className="library-card-stars">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {formatStars(library.githubStars)}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Description */}
      {library.description && (
        <p className="library-card-description">{library.description}</p>
      )}
      
      {/* Key Attributes - Two Columns */}
      <div className="library-card-attributes">
        {showAddToProject && (
          <AddToProjectModal
            isOpen={showAddToProject}
            library={library}
            onClose={() => setShowAddToProject(false)}
            onSuccess={handleAddSuccess}
            onCreateProject={() => {
              setShowAddToProject(false);
              setShowAddToNewProject(true);
            }}
          />
        )}
        {showAddToNewProject && (
          <div className="add-to-new-project-modal">
            {/* Replace with your actual new project modal/component */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '24px', maxWidth: '400px', margin: '32px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
              <h3>Add "{library.name}" to a New Project</h3>
              <p>Implement your new project creation flow here.</p>
              <button onClick={() => setShowAddToNewProject(false)}>Close</button>
            </div>
          </div>
        )}
        <div className="library-card-attributes-left">
          {library.categories && (
            <div className="library-card-attribute-item">
              <span className="library-card-attribute-label">Categories:</span>
              <span className="library-card-attribute-value">{library.categories}</span>
            </div>
          )}
          {library.cost && (
            <div className="library-card-attribute-item">
              <span className="library-card-attribute-label">Cost:</span>
              <span className="library-card-attribute-value">{library.cost}</span>
            </div>
          )}
        </div>
        <div className="library-card-attributes-right">
          {library.licenseType && (
            <div className="library-card-attribute-item">
              <span className="library-card-attribute-label">License:</span>
              <span className="library-card-attribute-value">{library.licenseType}</span>
            </div>
          )}
          {library.packageManager && (
            <div className="library-card-attribute-item">
              <span className="library-card-attribute-label">Platform:</span>
              <span className="library-card-attribute-value">{library.packageManager}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Compatible With Section */}
      {(library.supportedOs && library.supportedOs.length > 0) && (
        <div className="library-card-compatible-section">
          <span className="library-card-compatible-label">Compatible with:</span>
          <div className="library-card-compatible-badges">
            {library.supportedOs.length === 1 && library.supportedOs[0] === 'Cross-platform' ? (
              <span className="library-card-compatible-badge">Cross-platform</span>
            ) : (
              library.supportedOs.slice(0, 3).map((os, osIndex) => (
                <span key={osIndex} className="library-card-compatible-badge">{os}</span>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Tags Section */}
      {library.tags && library.tags.length > 0 && (
        <div className="library-card-tags-section">
          {library.tags.slice(0, 4).map((tag, tagIndex) => (
            <span key={tagIndex} className="library-card-tag-badge">{tag}</span>
          ))}
        </div>
      )}
      
      {/* Action Buttons at the bottom */}
      <div className="library-card-actions" style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
        <button
          className="view-details-btn"
          type="button"
          onClick={() => {
            if (library.onClick) library.onClick();
          }}
        >
          View Details
        </button>
        <div className="add-to-project-dropdown" style={{ position: 'relative' }}>
          <button
            className="add-to-project-btn"
            onClick={() => setDropdownOpen((open) => !open)}
            title="Add this library to a project"
          >
            + Add to Project
          </button>
          {dropdownOpen && (
            <div className="add-to-project-menu" style={{ position: 'fixed', left: '50%', top: 'calc(100% + 32px)', transform: 'translateX(-50%)', zIndex: 9999, background: '#fff', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 24px rgba(124,58,237,0.12)', minWidth: '220px', padding: '8px 0' }}>
              <button className="add-to-project-menu-item" style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', cursor: 'pointer' }} onClick={() => { setShowAddToNewProject(true); setDropdownOpen(false); }}>Add to New Project</button>
              <button className="add-to-project-menu-item" style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', textAlign: 'left', fontSize: '1rem', cursor: 'pointer' }} onClick={() => { setShowAddToProject(true); setDropdownOpen(false); }}>Add to Existing Project</button>
            </div>
          )}
        </div>
      </div>

      {/* Add to Project Modal */}
      {showAddToProject && (
        <AddToProjectModal
          isOpen={showAddToProject}
          library={library}
          onClose={() => setShowAddToProject(false)}
          onSuccess={handleAddSuccess}
          onCreateProject={() => {
            setShowAddToProject(false);
            setShowAddToNewProject(true);
          }}
        />
      )}
      {showAddToNewProject && (
        <div className="add-to-new-project-modal">
          {/* Replace with your actual new project modal/component */}
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '24px', maxWidth: '400px', margin: '32px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <h3>Add "{library.name}" to a New Project</h3>
            <p>Implement your new project creation flow here.</p>
            <button onClick={() => setShowAddToNewProject(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryCard;
