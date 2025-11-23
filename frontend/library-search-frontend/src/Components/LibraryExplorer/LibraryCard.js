
// src/Components/LibraryExplorer/LibraryCard.js
import React from 'react';

function formatStars(stars) {
  if (!stars && stars !== 0) return 'N/A';
  if (stars >= 1_000_000) return `${(stars / 1_000_000).toFixed(1)}M`;
  if (stars >= 1_000) return `${(stars / 1_000).toFixed(1)}k`;
  return stars.toString();
}

function LibraryCard({ library, onClick, onToggleCompare, isSelectedForCompare }) {
  return (
    <div className="library-card" onClick={onClick}>
      <div>
        <div className="library-card__title">{library.name}</div>
        <div className="library-card__meta">
          {library.category && <span>{library.category}</span>}
          {library.framework && <span>{library.framework}</span>}
          {library.qualityGrade && (
            <span className="chip">Quality: {library.qualityGrade}</span>
          )}
        </div>
      </div>

      <div className="library-card__meta">
        <span>⭐ {formatStars(library.githubStars)}</span>
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
      </div>
    </div>
  );
}

export default LibraryCard;
