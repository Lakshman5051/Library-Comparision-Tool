import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './ProjectList.css';
import { authenticatedFetch } from '../../utils/apiClient';

const ProjectList = forwardRef(({ onManageProject, onCreateProject }, ref) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'libraries'
  // Use relative URL to work with proxy (package.json proxy: http://localhost:8080)
  // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const hasFetchedRef = useRef(false); // prevent double fetch in React.StrictMode (dev)

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching projects...');

    try {
      const response = await authenticatedFetch('/api/projects', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      if (data.success) {
        setProjects(data.projects || []);
      } else {
        throw new Error(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Guard against React.StrictMode double-invoking effects in development
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProjects();
  }, []);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchProjects
  }));

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }

      if (data.success) {
        // Refresh the list after deletion
        fetchProjects();
      } else {
        throw new Error(data.message || 'Failed to delete project');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete project');
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

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    let result = [...projects];

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'libraries':
          return (b.libraryCount || 0) - (a.libraryCount || 0);
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [projects, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="project-list-loading">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-list-error">
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Error Loading Projects</h3>
        <p>{error}</p>
        <button onClick={fetchProjects} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-list-empty">
        <div className="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2>No Projects Yet</h2>
        <p>Create your first project to organize your libraries</p>
        <button onClick={onCreateProject} className="create-first-project-button">
          Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div className="project-list">
      <div className="project-list-header">
        <div className="header-title">
          <h2>My Projects ({filteredAndSortedProjects.length})</h2>
          {statusFilter !== 'ALL' && (
            <span className="filter-badge">
              Filtered by: {getStatusLabel(statusFilter)}
            </span>
          )}
        </div>
        {/* Removed 'New Project' button as per request */}
      </div>

      {/* Filter and Sort Controls */}
      <div className="project-controls">
        <div className="control-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Date Created (Newest)</option>
            <option value="name">Name (A-Z)</option>
            <option value="libraries">Library Count</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="no-results">
          <p>No projects match your current filters.</p>
          <button onClick={() => setStatusFilter('ALL')} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredAndSortedProjects.map((project) => (
          <div key={project.id} className="project-card" onClick={() => onManageProject(project)}>
            <div className="project-card-header">
              <div className="project-card-title">
                <h3>{project.name}</h3>
                <span className={`project-status-badge ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <div className="project-card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageProject(project);
                  }}
                  className="icon-button manage-button"
                  title="Manage Project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                  className="icon-button delete-button"
                  title="Delete Project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <p className="project-card-description">
              {project.description || 'No description provided'}
            </p>

            <div className="project-card-footer">
              <div className="project-card-meta">
                <span className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  {project.libraryCount || 0} {project.libraryCount === 1 ? 'library' : 'libraries'}
                </span>
                <span className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
});

export default ProjectList;