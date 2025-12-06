import React from 'react';
import './UserDashboard.css';

function UserDashboard({ onSearchLibraries, onCreateProject, onViewFavorites }) {
  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome to your Developer Workspace</h1>
          <p className="dashboard-subtitle">Choose how you want to start:</p>
        </div>

        <div className="dashboard-options">
          <button className="dashboard-card" onClick={onCreateProject}>
            <div className="dashboard-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <h3 className="dashboard-card-title">Create a Project</h3>
            <p className="dashboard-card-description">
              Start a new project and add libraries to build your tech stack
            </p>
          </button>

          <button className="dashboard-card" onClick={onSearchLibraries}>
            <div className="dashboard-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="dashboard-card-title">Search Libraries</h3>
            <p className="dashboard-card-description">
              Explore and compare thousands of libraries to find the perfect fit
            </p>
          </button>

          <button className="dashboard-card" onClick={onViewFavorites}>
            <div className="dashboard-card-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </div>
            <h3 className="dashboard-card-title">Favorites</h3>
            <p className="dashboard-card-description">
              View your saved libraries and quick access to your favorites
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

