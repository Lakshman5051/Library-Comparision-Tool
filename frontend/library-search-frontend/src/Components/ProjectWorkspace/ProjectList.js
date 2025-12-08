import React from 'react';
import './ProjectList.css';

function ProjectList({ onManageProject, onCreateProject }) {
  // No API calls - just show the empty state for now
  // This will be implemented later when the backend is ready

  return (
    <div className="project-list-empty">
      <div className="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <h2>No Projects Yet</h2>
      <button onClick={onCreateProject} className="create-first-project-button">
        Create Your First Project
      </button>
    </div>
  );
}

export default ProjectList;
