import React from 'react';

function formatStars(stars) {
  if (!stars && stars !== 0) return 'N/A';
  if (stars >= 1_000_000) return `${(stars / 1_000_000).toFixed(1)}M`;
  if (stars >= 1_000) return `${(stars / 1_000).toFixed(1)}k`;
  return stars.toString();
}

function LibraryCard({ library, onClick, onToggleCompare, isSelectedForCompare }) {
  return (
    <div className={`library-card ${isSelectedForCompare ? 'selected' : ''}`}>
      {/* Header Section */}
      <div className="library-card-header">
        <div className="library-card-title-row">
          <div className="library-card-title-large">{library.name}</div>
          {library.latestVersion && (
            <span className="library-card-version-badge">v{library.latestVersion}</span>
          )}
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
      
      {/* Action Button */}
      <div className="library-card-actions">
        <button
          className="btn-primary"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
        >
          {isSelectedForCompare ? 'Remove' : 'Compare'}
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default LibraryCard;
