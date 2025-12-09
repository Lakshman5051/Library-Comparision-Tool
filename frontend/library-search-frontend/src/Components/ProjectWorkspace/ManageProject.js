import React, { useState, useEffect } from 'react';
import './ManageProject.css';

function ManageProject({ project, onBack, onNavigateToCatalog }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [projectData, setProjectData] = useState(project);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Fetch project details including libraries
  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects/${project.id}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project details');
      }

      if (data.success && data.project) {
        setProjectData(data.project);
        setEditForm({
          name: data.project.name,
          description: data.project.description || '',
          status: data.project.status
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch libraries in this project
  const fetchLibraries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${project.id}/libraries`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch libraries');
      }

      if (data.success) {
        setLibraries(data.libraries || []);
      }
    } catch (err) {
      console.error('Error fetching libraries:', err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchLibraries();
  }, [project.id]);

  // Handle project update
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
      }

      if (data.success && data.project) {
        setProjectData(data.project);
        setIsEditing(false);
        alert('Project updated successfully!');
      }
    } catch (err) {
      setError(err.message);
      alert(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  // Handle library removal
  const handleRemoveLibrary = async (libraryId, libraryName) => {
    if (!window.confirm(`Remove "${libraryName}" from this project?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/projects/${project.id}/libraries/${libraryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove library');
      }

      if (data.success) {
        // Refresh libraries list
        fetchLibraries();
        fetchProjectDetails(); // Update library count
      }
    } catch (err) {
      alert(err.message || 'Failed to remove library');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'PLANNING': 'planning',
      'ACTIVE': 'active',
      'ON_HOLD': 'on-hold',
      'COMPLETED': 'completed'
    };
    return statusMap[status] || 'planning';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'PLANNING': 'Planning',
      'ACTIVE': 'Active',
      'ON_HOLD': 'On Hold',
      'COMPLETED': 'Completed'
    };
    return labelMap[status] || status;
  };

  // Filter libraries based on search query
  const filteredLibraries = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return libraries;
    }

    const query = searchQuery.toLowerCase();
    return libraries.filter(library => {
      return (
        library.name.toLowerCase().includes(query) ||
        (library.description && library.description.toLowerCase().includes(query)) ||
        (library.language && library.language.toLowerCase().includes(query)) ||
        (library.packageManager && library.packageManager.toLowerCase().includes(query))
      );
    });
  }, [libraries, searchQuery]);

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
          <span className={`project-status-badge ${getStatusColor(projectData.status)}`}>
            {getStatusLabel(projectData.status)}
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
                  <span className={`detail-value status ${getStatusColor(projectData.status)}`}>
                    {getStatusLabel(projectData.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Libraries</span>
                  <span className="detail-value">{projectData.libraryCount || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {projectData.createdAt ? new Date(projectData.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {projectData.updatedAt ? new Date(projectData.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button
                  className="action-button"
                  onClick={() => setActiveTab('libraries')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  View Libraries
                </button>
                <button
                  className="action-button"
                  onClick={() => setIsEditing(true)}
                >
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
                <div className="empty-libraries-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h3>No libraries added yet</h3>
                <p>Browse the library catalog and add libraries to this project.</p>
                <button
                  className="add-library-button"
                  onClick={onNavigateToCatalog} // Use the new prop here
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Browse Catalog to Add
                </button>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="libraries-search">
                  <div className="search-input-wrapper">
                    <div className="search-bar-container left-align">
                      <input
                        type="text"
                        className="search-input with-icon"
                        placeholder="Search libraries by name, language, platform..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <span className="search-icon-inside">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                      </span>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="clear-search-button"
                        title="Clear search"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    className="add-more-libraries-button"
                    onClick={onNavigateToCatalog}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add More Libraries
                  </button>
                </div>

                {searchQuery && (
                    <p className="search-results-count">
                      {filteredLibraries.length} of {libraries.length} libraries
                    </p>
                )}

                {filteredLibraries.length === 0 ? (
                  <div className="no-search-results">
                    <p>No libraries match your search criteria.</p>
                    <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="libraries-list">
                    {filteredLibraries.map((library) => (
                  <div key={library.id} className="library-item">
                    <div className="library-item-header">
                      <div className="library-info">
                        <h4>{library.name}</h4>
                        <p className="library-description">
                          {library.description || 'No description available'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveLibrary(library.id, library.name)}
                        className="remove-library-button"
                        title="Remove from project"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div className="library-item-meta">
                      {library.language && (
                        <span className="meta-tag">{library.language}</span>
                      )}
                      {library.packageManager && (
                        <span className="meta-tag">{library.packageManager}</span>
                      )}
                      {library.githubStars && (
                        <span className="meta-tag">
                          ⭐ {library.githubStars.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>Edit Project</h3>

            {!isEditing ? (
              <div className="settings-view">
                <div className="settings-item">
                  <span className="settings-label">Project Name</span>
                  <span className="settings-value">{projectData.name}</span>
                </div>
                <div className="settings-item">
                  <span className="settings-label">Description</span>
                  <span className="settings-value">{projectData.description || 'No description'}</span>
                </div>
                <div className="settings-item">
                  <span className="settings-label">Status</span>
                  <span className="settings-value">{getStatusLabel(projectData.status)}</span>
                </div>
                <button onClick={() => setIsEditing(true)} className="edit-settings-button">
                  Edit Project Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProject} className="edit-project-form">
                {error && (
                  <div className="form-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="edit-name">
                    Project Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: projectData.name,
                        description: projectData.description || '',
                        status: projectData.status
                      });
                    }}
                    className="cancel-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading || !editForm.name.trim()}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProject;