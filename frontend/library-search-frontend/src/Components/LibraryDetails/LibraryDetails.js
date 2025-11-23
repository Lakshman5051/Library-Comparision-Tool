import React from 'react';
import './LibraryDetails.css';

const LibraryDetails = ({ library, onClose }) => {
  if (!library) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-main">
            <h2>{library.name}</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <p className="library-description">{library.description || 'No description available'}</p>
          
          {/* Quick Stats Bar */}
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{formatNumber(library.githubStars)}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">🔗</span>
              <span className="stat-value">{formatNumber(library.dependentProjectsCount)}</span>
              <span className="stat-label">Dependents</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">🔱</span>
              <span className="stat-value">{formatNumber(library.githubForks)}</span>
              <span className="stat-label">Forks</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">📊</span>
              <span className="stat-value">{library.qualityGrade || 'N/A'}</span>
              <span className="stat-label">Grade</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="modal-body">
          
          {/* Version Information */}
          <section className="details-section">
            <h3 className="section-title">📦 Version Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Latest Version:</span>
                <span className="detail-value">{library.latestVersion || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">{library.lastUpdated || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Commit:</span>
                <span className="detail-value">{formatDate(library.lastCommitDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Actively Maintained:</span>
                <span className={`detail-value ${library.activelyMaintained ? 'status-active' : 'status-inactive'}`}>
                  {library.activelyMaintained ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </section>

          {/* Platform & Technology */}
          <section className="details-section">
            <h3 className="section-title">💻 Platform & Technology</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Package Manager:</span>
                <span className="detail-value badge-platform">{library.packageManager || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Language:</span>
                <span className="detail-value">{library.language || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Framework:</span>
                <span className="detail-value">{library.framework || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Runtime Environment:</span>
                <span className="detail-value">{library.runtimeEnvironment || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{library.category || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* Cost & Licensing */}
          <section className="details-section">
            <h3 className="section-title">💰 Cost & Licensing</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Cost:</span>
                <span className="detail-value badge-cost">{library.cost || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">License Type:</span>
                <span className="detail-value">{library.licenseType || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Supplier:</span>
                <span className="detail-value">{library.supplier || 'Community'}</span>
              </div>
            </div>
          </section>

          {/* Dependencies */}
          <section className="details-section">
            <h3 className="section-title">🔗 Dependencies</h3>
            <div className="details-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Dependency Count:</span>
                <span className="detail-value">{library.dependencyCount || 0} dependencies</span>
              </div>
              {library.dependencyNames && library.dependencyNames.length > 0 && (
                <div className="detail-item full-width">
                  <span className="detail-label">Dependencies:</span>
                  <div className="dependency-list">
                    {library.dependencyNames.slice(0, 10).map((dep, index) => (
                      <span key={index} className="dependency-badge">{dep}</span>
                    ))}
                    {library.dependencyNames.length > 10 && (
                      <span className="dependency-badge more">+{library.dependencyNames.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Status & Security */}
          <section className="details-section">
            <h3 className="section-title">🛡️ Status & Security</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Deprecated:</span>
                <span className={`detail-value ${library.isDeprecated ? 'status-warning' : 'status-active'}`}>
                  {library.isDeprecated ? '⚠️ Yes' : '✓ No'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Security Vulnerabilities:</span>
                <span className={`detail-value ${library.hasSecurityVulnerabilities ? 'status-danger' : 'status-active'}`}>
                  {library.hasSecurityVulnerabilities ? '❌ Yes' : '✓ None Known'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quality Grade:</span>
                <span className={`detail-value grade-badge grade-${library.qualityGrade}`}>
                  {library.qualityGrade || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Popularity Score:</span>
                <span className="detail-value">{library.popularityScore?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* Links & Resources */}
          <section className="details-section">
            <h3 className="section-title">🔗 Links & Resources</h3>
            <div className="links-grid">
              {library.homepageUrl && (
                <a href={library.homepageUrl} target="_blank" rel="noopener noreferrer" className="resource-link">
                  <span className="link-icon">🏠</span>
                  <span>Homepage</span>
                </a>
              )}
              {library.repositoryUrl && (
                <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer" className="resource-link">
                  <span className="link-icon">💻</span>
                  <span>Repository</span>
                </a>
              )}
              {library.documentationUrl && (
                <a href={library.documentationUrl} target="_blank" rel="noopener noreferrer" className="resource-link">
                  <span className="link-icon">📚</span>
                  <span>Documentation</span>
                </a>
              )}
              {library.packageUrl && (
                <a href={library.packageUrl} target="_blank" rel="noopener noreferrer" className="resource-link">
                  <span className="link-icon">📦</span>
                  <span>Package Registry</span>
                </a>
              )}
            </div>
          </section>

          {/* Additional Information */}
          {(library.tags?.length > 0 || library.supportedOs?.length > 0 || library.keywords) && (
            <section className="details-section">
              <h3 className="section-title">📋 Additional Information</h3>
              
              {library.tags && library.tags.length > 0 && (
                <div className="detail-item full-width">
                  <span className="detail-label">Tags:</span>
                  <div className="tag-list">
                    {library.tags.map((tag, index) => (
                      <span key={index} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {library.supportedOs && library.supportedOs.length > 0 && (
                <div className="detail-item full-width">
                  <span className="detail-label">Supported OS:</span>
                  <div className="tag-list">
                    {library.supportedOs.map((os, index) => (
                      <span key={index} className="os-badge">{os}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {library.keywords && (
                <div className="detail-item full-width">
                  <span className="detail-label">Keywords:</span>
                  <span className="detail-value">{library.keywords}</span>
                </div>
              )}
            </section>
          )}

          {/* Example Code */}
          {library.exampleCodeSnippet && (
            <section className="details-section">
              <h3 className="section-title">💡 Example Usage</h3>
              <pre className="code-snippet">{library.exampleCodeSnippet}</pre>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LibraryDetails;