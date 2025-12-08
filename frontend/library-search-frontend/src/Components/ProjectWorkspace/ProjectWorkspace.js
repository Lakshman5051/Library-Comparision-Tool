import React, { useState, useRef } from 'react';
import './ProjectWorkspace.css';
import CreateProject from './CreateProject';
import ProjectList from './ProjectList';
import ManageProject from './ManageProject';

function ProjectWorkspace({ onBack }) {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'manage'
  const [selectedProject, setSelectedProject] = useState(null);
  const projectListRef = useRef(null);

  const handleCreateProject = () => {
    setCurrentView('create');
  };

  const handleViewProjects = () => {
    setCurrentView('list');
    setSelectedProject(null);
    // Refresh project list
    if (projectListRef.current && projectListRef.current.refresh) {
      projectListRef.current.refresh();
    }
  };

  const handleManageProject = (project) => {
    setSelectedProject(project);
    setCurrentView('manage');
  };

  const handleProjectCreated = (project) => {
    setCurrentView('list');
    // Refresh project list after creation
    if (projectListRef.current && projectListRef.current.refresh) {
      projectListRef.current.refresh();
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('list');
    setSelectedProject(null);
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="project-workspace">
      <div className="workspace-container">
        {/* Header */}
        <div className="workspace-header">
          <div className="workspace-header-content">
            <button className="back-button" onClick={handleBackToDashboard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </button>
            <h1 className="workspace-title">Project Workspace</h1>
            <p className="workspace-subtitle">Manage your projects and libraries</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="workspace-tabs">
          <button
            className={`tab-button ${currentView === 'list' ? 'active' : ''}`}
            onClick={handleViewProjects}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            All Projects
          </button>
          <button
            className={`tab-button ${currentView === 'create' ? 'active' : ''}`}
            onClick={handleCreateProject}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Project
          </button>
          {selectedProject && (
            <button
              className={`tab-button ${currentView === 'manage' ? 'active' : ''}`}
              onClick={() => setCurrentView('manage')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Manage Project
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="workspace-content">
          {currentView === 'list' && (
            <ProjectList
              ref={projectListRef}
              onManageProject={handleManageProject}
              onCreateProject={handleCreateProject}
            />
          )}
          {currentView === 'create' && (
            <CreateProject
              onProjectCreated={handleProjectCreated}
              onCancel={handleViewProjects}
            />
          )}
          {currentView === 'manage' && selectedProject && (
            <ManageProject
              project={selectedProject}
              onBack={handleViewProjects}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectWorkspace;
