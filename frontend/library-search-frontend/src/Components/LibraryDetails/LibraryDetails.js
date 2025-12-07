import React, { useState } from 'react';
import './LibraryDetails.css';

const LibraryDetails = ({ library, onClose }) => {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  if (!library) return null;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return num.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Generate install command based on package manager
  const getInstallCommand = () => {
    if (!library.name) return null;
    
    const libraryName = library.name;
    
    // If packageManager exists, use it to generate command
    if (library.packageManager) {
      const packageManager = library.packageManager.toLowerCase();
      
      switch (packageManager) {
        case 'npm':
          return `npm install ${libraryName}`;
        case 'maven':
          return library.mavenCoordinates || `mvn install ${libraryName}`;
        case 'pypi':
        case 'pip':
          return `pip install ${libraryName}`;
        case 'cargo':
          return `cargo add ${libraryName}`;
        case 'composer':
          return `composer require ${libraryName}`;
        case 'nuget':
          return `dotnet add package ${libraryName}`;
        case 'go':
          return `go get ${libraryName}`;
        default:
          return `npm install ${libraryName}`;
      }
    }
    
    // Fallback: try to infer from language
    if (library.language) {
      const lang = library.language.toLowerCase();
      if (lang === 'javascript' || lang === 'typescript') {
        return `npm install ${libraryName}`;
      } else if (lang === 'python') {
        return `pip install ${libraryName}`;
      } else if (lang === 'java') {
        return `mvn install ${libraryName}`;
      } else if (lang === 'rust') {
        return `cargo add ${libraryName}`;
      } else if (lang === 'go') {
        return `go get ${libraryName}`;
      }
    }
    
    // Final fallback
    return `npm install ${libraryName}`;
  };

  const installCommand = getInstallCommand();
  // Source code URL should be repositoryUrl (from database), not homepageUrl
  const sourceCodeUrl = library.repositoryUrl || null;
  const addedDate = formatDate(library.lastRegistryReleaseDate || library.lastRepositoryReleaseDate);

  const handleCopyInstall = () => {
    if (installCommand) {
      navigator.clipboard.writeText(installCommand);
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    }
  };

  const handleCopyExample = () => {
    if (library.exampleCodeSnippet) {
      navigator.clipboard.writeText(library.exampleCodeSnippet);
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    }
  };


  return (
    <div className="library-details-overlay" onClick={onClose}>
      <div className="library-details-content" onClick={(e) => e.stopPropagation()}>
        {/* Main Content - Card Layout */}
        <div className="library-details-body">
          
          {/* Library Header Section - Name, Description, and Metrics */}
          <div className="library-details-header-card">
            <div className="library-details-header-top">
              <div className="library-details-title-section">
                <h1 className="library-details-title">{library.name}</h1>
                
                {/* Description under the name */}
                {library.description && (
                  <p className="library-details-description-main">{library.description}</p>
                )}
                
                {/* Metrics Row - Stars, Forks, Dependents, Quality Grade */}
                <div className="library-details-metrics-row">
                  {library.githubStars !== undefined && library.githubStars !== null && (
                    <div className="library-details-metric-item">
                      <svg className="library-details-metric-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span className="library-details-metric-value">{formatNumber(library.githubStars)}</span>
                      <span className="library-details-metric-label">Stars</span>
                    </div>
                  )}
                  
                  {library.githubForks !== undefined && library.githubForks !== null && (
                    <div className="library-details-metric-item">
                      <svg className="library-details-metric-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="18" r="3"></circle>
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="18" cy="6" r="3"></circle>
                        <path d="M18 9v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9"></path>
                        <path d="M18 9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3"></path>
                        <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"></path>
                      </svg>
                      <span className="library-details-metric-value">{formatNumber(library.githubForks)}</span>
                      <span className="library-details-metric-label">Forks</span>
                    </div>
                  )}
                  
                  {library.dependentProjectsCount !== undefined && library.dependentProjectsCount !== null && (
                    <div className="library-details-metric-item">
                      <svg className="library-details-metric-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <path d="M20 8v6"></path>
                        <path d="M23 11h-6"></path>
                      </svg>
                      <span className="library-details-metric-value">{formatNumber(library.dependentProjectsCount)}</span>
                      <span className="library-details-metric-label">Dependents</span>
                    </div>
                  )}
                  
                  {library.qualityGrade && (
                    <div className="library-details-metric-item">
                      <svg className="library-details-metric-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span className={`library-details-metric-value library-details-grade library-details-grade-${library.qualityGrade}`}>
                        {library.qualityGrade}
                      </span>
                      <span className="library-details-metric-label">Quality</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="library-details-close" onClick={onClose}>✕</button>
            </div>
          </div>

          {/* Key Details Card - Two Columns */}
          <div className="library-details-card">
            <div className="library-details-key-details">
              <div className="library-details-key-details-left">
                {library.categories && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">Categories:</span>
                    <span className="library-details-key-value">{library.categories}</span>
                  </div>
                )}
                {library.language && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">Language:</span>
                    <span className="library-details-key-value">{library.language}</span>
                  </div>
                )}
                {library.latestVersion && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">Version:</span>
                    <span className="library-details-key-value">{library.latestVersion}</span>
                  </div>
                )}
              </div>
              <div className="library-details-key-details-right">
                {library.licenseType && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">License:</span>
                    <span className="library-details-key-value">{library.licenseType}</span>
                  </div>
                )}
                {library.cost && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">Cost:</span>
                    <span className="library-details-key-value">{library.cost}</span>
                  </div>
                )}
                {library.packageManager && (
                  <div className="library-details-key-item">
                    <span className="library-details-key-label">Platform:</span>
                    <span className="library-details-key-value">{library.packageManager}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Use Case Card - Prominently displayed for non-technical users */}
          {library.useCase && (
            <div className="library-details-card library-details-usecase-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <h2 className="library-details-card-title">When to Use This Library</h2>
              </div>
              <p className="library-details-usecase-text">{library.useCase}</p>
            </div>
          )}

          {/* Example Code Card */}
          {library.exampleCodeSnippet && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <h2 className="library-details-card-title">Example Code</h2>
              </div>
              <div className="library-details-code-block">
                <pre className="library-details-code-pre">
                  <code className="library-details-code">{library.exampleCodeSnippet}</code>
                </pre>
                <button 
                  className="library-details-copy-btn"
                  onClick={handleCopyExample}
                  title="Copy to clipboard"
                >
                  {copiedExample ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tags Card */}
          {library.tags && library.tags.length > 0 && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <h2 className="library-details-card-title">Tags</h2>
              </div>
              <div className="library-details-tags">
                {library.tags.map((tag, index) => (
                  <span key={index} className="library-details-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Source Code Card */}
          {sourceCodeUrl && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <h2 className="library-details-card-title">Source Code</h2>
              </div>
              <a 
                href={sourceCodeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="library-details-source-link"
              >
                {sourceCodeUrl}
              </a>
            </div>
          )}

          {/* Install Command Card */}
          {installCommand && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <h2 className="library-details-card-title">Install Command</h2>
              </div>
              <div className="library-details-code-block">
                <code className="library-details-code">{installCommand}</code>
                <button 
                  className="library-details-copy-btn"
                  onClick={handleCopyInstall}
                  title="Copy to clipboard"
                >
                  {copiedInstall ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Additional Information Cards */}
          {(library.framework || library.runtimeEnvironment || library.isDeprecated !== undefined || library.hasSecurityVulnerabilities !== undefined) && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h2 className="library-details-card-title">Additional Information</h2>
              </div>
              <div className="library-details-info-grid">
                {library.framework && (
                  <div className="library-details-info-item">
                    <span className="library-details-info-label">Framework</span>
                    <span className="library-details-info-value">{library.framework}</span>
                  </div>
                )}
                {library.runtimeEnvironment && (
                  <div className="library-details-info-item">
                    <span className="library-details-info-label">Runtime</span>
                    <span className="library-details-info-value">{library.runtimeEnvironment}</span>
                  </div>
                )}
                {library.isDeprecated !== undefined && library.isDeprecated !== null && (
                  <div className="library-details-info-item">
                    <span className="library-details-info-label">Status</span>
                    <span className={`library-details-info-value ${library.isDeprecated ? 'library-details-status-warning' : 'library-details-status-active'}`}>
                      {library.isDeprecated ? 'Deprecated' : 'Active'}
                    </span>
                  </div>
                )}
                {library.hasSecurityVulnerabilities !== undefined && library.hasSecurityVulnerabilities !== null && (
                  <div className="library-details-info-item">
                    <span className="library-details-info-label">Security</span>
                    <span className={`library-details-info-value ${library.hasSecurityVulnerabilities ? 'library-details-status-danger' : 'library-details-status-safe'}`}>
                      {library.hasSecurityVulnerabilities 
                        ? (library.vulnerabilityCount > 0 
                            ? `${library.vulnerabilityCount} Vulnerabilit${library.vulnerabilityCount === 1 ? 'y' : 'ies'} Found`
                            : 'Vulnerabilities Found')
                        : 'No Known Issues'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Vulnerabilities Card - Show detailed vulnerability information */}
          {library.vulnerabilities && library.vulnerabilities.length > 0 && (
            <div className="library-details-card library-details-vulnerabilities-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h2 className="library-details-card-title">
                  Security Vulnerabilities ({library.vulnerabilityCount || library.vulnerabilities.length})
                </h2>
              </div>
              <div className="library-details-vulnerabilities-list">
                {library.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="library-details-vulnerability-item">
                    <div className="library-details-vulnerability-header">
                      <div className="library-details-vulnerability-id">
                        {vuln.vulnerabilityId}
                      </div>
                      {vuln.severity && (
                        <span className={`library-details-severity-badge library-details-severity-${vuln.severity.toLowerCase()}`}>
                          {vuln.severity}
                        </span>
                      )}
                    </div>
                    {vuln.summary && (
                      <p className="library-details-vulnerability-summary">{vuln.summary}</p>
                    )}
                    <div className="library-details-vulnerability-details">
                      {vuln.affectedVersionRange && (
                        <div className="library-details-vulnerability-detail">
                          <span className="library-details-vulnerability-detail-label">Affected:</span>
                          <span className="library-details-vulnerability-detail-value">{vuln.affectedVersionRange}</span>
                        </div>
                      )}
                      {vuln.fixedVersion && (
                        <div className="library-details-vulnerability-detail">
                          <span className="library-details-vulnerability-detail-label">Fixed in:</span>
                          <span className="library-details-vulnerability-detail-value">{vuln.fixedVersion}</span>
                        </div>
                      )}
                      {vuln.cvssScore && (
                        <div className="library-details-vulnerability-detail">
                          <span className="library-details-vulnerability-detail-label">CVSS Score:</span>
                          <span className="library-details-vulnerability-detail-value">{vuln.cvssScore}</span>
                        </div>
                      )}
                      {vuln.source && (
                        <div className="library-details-vulnerability-detail">
                          <span className="library-details-vulnerability-detail-label">Source:</span>
                          <span className="library-details-vulnerability-detail-value">{vuln.source}</span>
                        </div>
                      )}
                    </div>
                    {vuln.references && (
                      <div className="library-details-vulnerability-references">
                        {vuln.references.split(',').map((ref, refIndex) => (
                          ref.trim() && (
                            <a 
                              key={refIndex}
                              href={ref.trim()} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="library-details-vulnerability-link"
                            >
                              Learn More
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supported OS Card */}
          {library.supportedOs && library.supportedOs.length > 0 && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h2 className="library-details-card-title">Compatible Across</h2>
              </div>
              <div className="library-details-os-list">
                {library.supportedOs.map((os, index) => (
                  <span key={index} className="library-details-os-badge">{os}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links Card */}
          {(library.homepageUrl || library.repositoryUrl || library.packageUrl) && (
            <div className="library-details-card">
              <div className="library-details-card-header">
                <svg className="library-details-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <h2 className="library-details-card-title">Links & Resources</h2>
              </div>
              <div className="library-details-links-grid">
                {library.homepageUrl && (
                  <a href={library.homepageUrl} target="_blank" rel="noopener noreferrer" className="library-details-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Homepage
                  </a>
                )}
                {library.repositoryUrl && (
                  <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer" className="library-details-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    Repository
                  </a>
                )}
                {library.packageUrl && (
                  <a href={library.packageUrl} target="_blank" rel="noopener noreferrer" className="library-details-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Package Registry
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="library-details-footer">
          <button className="library-details-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default LibraryDetails;
