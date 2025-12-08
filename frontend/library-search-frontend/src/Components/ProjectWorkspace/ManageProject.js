import React, { useState } from 'react';
import './ManageProject.css';

function ManageProject({ project, onBack }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'libraries', 'settings'
  const [projectData, setProjectData] = useState(project);

  // This will be populated when backend is ready
  const libraries = [];

  return (
    <div className="manage-project">
      <div className="manage-project-header">
        <div>
          <button onClick={onBack} className="back-to-list-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Projects
          </button>
          <h2>{projectData.name}</h2>
          <p className="project-subtitle">{projectData.description || 'No description'}</p>
        </div>
        <div className="project-header-actions">
          <span className={`project-status-badge ${projectData.status?.toLowerCase()}`}>
            {projectData.status || 'Planning'}
          </span>
        </div>
      </div>

      <div className="manage-project-tabs">
        <button
          className={`manage-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          Overview
        </button>
        <button
          className={`manage-tab ${activeTab === 'libraries' ? 'active' : ''}`}
          onClick={() => setActiveTab('libraries')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Libraries ({libraries.length})
        </button>
        <button
          className={`manage-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
          </svg>
          Settings
        </button>
      </div>

      <div className="manage-project-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-section">
              <h3>Project Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status ${projectData.status?.toLowerCase()}`}>
                    {projectData.status || 'Planning'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Visibility</span>
                  <span className="detail-value">
                    {projectData.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {projectData.createdAt ? new Date(projectData.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Libraries</span>
                  <span className="detail-value">{libraries.length}</span>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Library
                </button>
                <button className="action-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'libraries' && (
          <div className="libraries-tab">
            {libraries.length === 0 ? (
              <div className="empty-libraries">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <h3>No libraries added yet</h3>
                <p>Add libraries from the library search to build your tech stack</p>
                <button className="add-library-button">
                  Browse Libraries
                </button>
              </div>
            ) : (
              <div className="libraries-list">
                {/* Libraries will be listed here */}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>Project Settings</h3>
            <p className="settings-note">Settings functionality will be implemented in the next phase.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProject;
