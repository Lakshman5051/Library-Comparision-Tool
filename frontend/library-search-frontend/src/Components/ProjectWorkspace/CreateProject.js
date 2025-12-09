import React, { useState } from 'react';
import './CreateProject.css';

function CreateProject({ onProjectCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();
      let data;
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from server');
      }

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      if (data.success && data.project) {
        // Project created successfully
        if (onProjectCreated) {
          onProjectCreated(data.project);
        }
      } else {
        throw new Error(data.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-project">
      <div className="create-project-header">
        <h2>Create New Project</h2>
        <p>Start a new project and add libraries to build your tech stack</p>
      </div>

      <form onSubmit={handleSubmit} className="create-project-form">
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
          <label htmlFor="name">
            Project Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., My Awesome Web App"
            required
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project..."
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
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
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Creating...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;
