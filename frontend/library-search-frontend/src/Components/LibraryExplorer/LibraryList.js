// src/Components/LibraryExplorer/LibraryList.js
import React from 'react';
import LibraryCard from './LibraryCard';

function LibraryList({ libraries, onSelect, onToggleCompare, compareList }) {
  if (!libraries.length) {
    return <div>No libraries match your filters.</div>;
  }

  return (
    <div className="library-grid">
      {libraries.map((lib) => (
        <LibraryCard
          key={lib.id}
          library={lib}
          onClick={() => onSelect(lib)}
        />
      ))}
    </div>
  );
}

export default LibraryList;
