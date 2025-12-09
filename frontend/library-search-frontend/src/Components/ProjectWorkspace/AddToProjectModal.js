import React, { useState, useEffect } from 'react';
import './AddToProjectModal.css';

function AddToProjectModal({ isOpen, onClose, library, onSuccess }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Fetch user's projects
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setFetchingProjects(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      if (data.success) {
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleAddToProject = async () => {
    if (!selectedProjectId) {
      alert('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects/${selectedProjectId}/libraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ libraryId: library.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add library to project');
      }

      if (data.success) {
        if (onSuccess) {
          onSuccess(selectedProjectId);
        }
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to add library to project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add to Project</h3>
          <button className="modal-close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="modal-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="library-info">
            <div className="library-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <h4>{library.name}</h4>
              <p>{library.description || 'No description available'}</p>
            </div>
          </div>

          {fetchingProjects ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="modal-empty">
              <p>You don't have any projects yet.</p>
              <p className="modal-hint">Create a project first to add libraries to it.</p>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="project-select">Select Project</label>
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={loading}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.libraryCount || 0} libraries)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddToProject}
            className="btn-primary"
            disabled={loading || projects.length === 0 || !selectedProjectId}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Adding...
              </>
            ) : (
              'Add to Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToProjectModal;