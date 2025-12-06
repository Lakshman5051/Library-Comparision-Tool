import React from 'react';
import './ComparisonView.css';

function ComparisonView({ libraries, onClose, onRemoveLibrary }) {

  // Calculate overall score for a library
  const calculateOverallScore = (library) => {
    let score = 0;
    let factors = 0;

    // Stars score (0-10)
    if (library.githubStars) {
      const starScore = Math.min(10, (Math.log10(library.githubStars + 1) / Math.log10(100000)) * 10);
      score += starScore;
      factors++;
    }

    // Maintenance score (0-10)
    if (library.lastCommitDate) {
      const daysSinceCommit = Math.floor(
        (new Date() - new Date(library.lastCommitDate)) / (1000 * 60 * 60 * 24)
      );
      let maintenanceScore = 0;
      if (daysSinceCommit <= 7) maintenanceScore = 10;
      else if (daysSinceCommit <= 30) maintenanceScore = 8;
      else if (daysSinceCommit <= 90) maintenanceScore = 6;
      else if (daysSinceCommit <= 180) maintenanceScore = 4;
      else maintenanceScore = 2;
      score += maintenanceScore;
      factors++;
    }

    // Community score (0-10)
    if (library.dependentProjectsCount) {
      const communityScore = Math.min(10, (Math.log10(library.dependentProjectsCount + 1) / Math.log10(100000)) * 10);
      score += communityScore;
      factors++;
    }

    // Security score (0-10)
    let securityScore = library.hasSecurityVulnerabilities ? 3 : 10;
    if (library.isDeprecated) securityScore = Math.min(securityScore, 2);
    score += securityScore;
    factors++;

    // Quality grade score (0-10)
    const gradeMap = { 'A': 10, 'B': 8, 'C': 6, 'D': 4, 'F': 2 };
    score += gradeMap[library.qualityGrade] || 5;
    factors++;

    const average = factors > 0 ? score / factors : 0;
    return average.toFixed(1);
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (!num || num === 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Format supported OS list
  const formatSupportedOS = (supportedOs) => {
    if (!supportedOs || supportedOs.length === 0) return 'Not specified';
    if (supportedOs.length <= 3) return supportedOs.join(', ');
    return `${supportedOs.slice(0, 3).join(', ')} +${supportedOs.length - 3} more`;
  };

  const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'];

  // Find the library with the highest score
  const scores = libraries.map(lib => parseFloat(calculateOverallScore(lib)));
  const maxScore = Math.max(...scores);

  return (
    <div className="comparison-view-overlay">
      <div className="comparison-view-container">
        <div className="comparison-header">
          <h2>Library Comparison</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close comparison">
            ✕
          </button>
        </div>

        {/* Scorecard Section */}
        <div className="scorecard-section">
          {libraries.map((library, idx) => {
            const overallScore = calculateOverallScore(library);
            const isTopScore = parseFloat(overallScore) === maxScore && libraries.length > 1;

            return (
              <div key={library.id} className="library-scorecard" style={{ borderTopColor: colors[idx % colors.length] }}>
                <div className="scorecard-header">
                  <div>
                    <h3>{library.name}</h3>
                    <p className="library-category">{library.category || 'General'}</p>
                  </div>
                  <button
                    className="remove-library-btn"
                    onClick={() => onRemoveLibrary(library.id)}
                    aria-label={`Remove ${library.name}`}
                    title="Remove from comparison"
                  >
                    ✕
                  </button>
                </div>

                <div className="overall-score">
                  <div className="score-circle" style={{ borderColor: colors[idx % colors.length] }}>
                    <span className="score-value">{overallScore}</span>
                    <span className="score-max">/10</span>
                  </div>
                  <div className="score-details">
                    <div className="quality-badge" data-grade={library.qualityGrade}>
                      Grade: {library.qualityGrade || 'N/A'}
                    </div>
                    {isTopScore && (
                      <div className="top-score-badge">🏆 Top Score</div>
                    )}
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-icon">⭐</span>
                    <div className="metric-content">
                      <span className="metric-label">GitHub Stars</span>
                      <span className="metric-value">{formatNumber(library.githubStars)}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">👥</span>
                    <div className="metric-content">
                      <span className="metric-label">Used By</span>
                      <span className="metric-value">{formatNumber(library.dependentProjectsCount)} projects</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">🔧</span>
                    <div className="metric-content">
                      <span className="metric-label">Forks</span>
                      <span className="metric-value">{formatNumber(library.githubForks)}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">💻</span>
                    <div className="metric-content">
                      <span className="metric-label">Supported OS</span>
                      <span className="metric-value">{formatSupportedOS(library.supportedOs)}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">🕒</span>
                    <div className="metric-content">
                      <span className="metric-label">Last Commit</span>
                      <span className="metric-value">{formatDate(library.lastCommitDate)}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">🔒</span>
                    <div className="metric-content">
                      <span className="metric-label">Security</span>
                      <span className={`metric-value ${library.hasSecurityVulnerabilities ? 'warning' : 'success'}`}>
                        {library.hasSecurityVulnerabilities ? '⚠️ Issues Found' : '✅ No Issues'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">📄</span>
                    <div className="metric-content">
                      <span className="metric-label">License</span>
                      <span className="metric-value">{library.licenseType || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="metric-icon">📌</span>
                    <div className="metric-content">
                      <span className="metric-label">Latest Version</span>
                      <span className="metric-value">{library.latestVersion || 'N/A'}</span>
                    </div>
                  </div>

                  {library.isDeprecated && (
                    <div className="metric-item deprecated-warning">
                      <span className="metric-icon">⚠️</span>
                      <div className="metric-content">
                        <span className="metric-label">Status</span>
                        <span className="metric-value warning">Deprecated</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links */}
                {(library.homepageUrl || library.repositoryUrl || library.documentationUrl) && (
                  <div className="library-links">
                    {library.homepageUrl && (
                      <a href={library.homepageUrl} target="_blank" rel="noopener noreferrer" className="lib-link">
                        🌐 Homepage
                      </a>
                    )}
                    {library.repositoryUrl && (
                      <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer" className="lib-link">
                        💻 Repository
                      </a>
                    )}
                    {library.documentationUrl && (
                      <a href={library.documentationUrl} target="_blank" rel="noopener noreferrer" className="lib-link">
                        📚 Docs
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComparisonView;