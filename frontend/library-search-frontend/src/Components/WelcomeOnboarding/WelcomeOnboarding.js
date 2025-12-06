import React from 'react';
import './WelcomeOnboarding.css';

// Sample library data for floating cards
const sampleLibraries = [
  { name: 'React', version: 'v19.1.0', category: 'Frontend', license: 'MIT', cost: 'Free', stars: 235000, updated: '3/1/2025', tags: ['JavaScript', 'UI', 'Library', 'Web'] },
  { name: 'Express', version: 'v4.18.2', category: 'Backend', license: 'MIT', cost: 'Free', stars: 68000, updated: '2/15/2025', tags: ['Node.js', 'Server', 'API'] },
  { name: 'Vue.js', version: 'v3.4.0', category: 'Frontend', license: 'MIT', cost: 'Free', stars: 245000, updated: '2/20/2025', tags: ['JavaScript', 'Framework', 'UI'] },
  { name: 'TypeScript', version: 'v5.3.0', category: 'Language', license: 'Apache-2.0', cost: 'Free', stars: 102000, updated: '2/28/2025', tags: ['TypeScript', 'Compiler', 'Language'] },
  { name: 'PostgreSQL', version: 'v16.0', category: 'Database', license: 'PostgreSQL', cost: 'Free', stars: 14500, updated: '3/5/2025', tags: ['Database', 'SQL', 'Open Source'] },
  { name: 'MongoDB', version: 'v7.0', category: 'Database', license: 'SSPL', cost: 'Free', stars: 28000, updated: '2/10/2025', tags: ['NoSQL', 'Database', 'Document'] },
  { name: 'Docker', version: 'v24.0', category: 'DevOps', license: 'Apache-2.0', cost: 'Free', stars: 72000, updated: '3/1/2025', tags: ['Container', 'DevOps', 'Deployment'] },
  { name: 'Redis', version: 'v7.2', category: 'Database', license: 'BSD', cost: 'Free', stars: 68000, updated: '2/25/2025', tags: ['Cache', 'Database', 'In-Memory'] },
  { name: 'Angular', version: 'v17.0', category: 'Frontend', license: 'MIT', cost: 'Free', stars: 95000, updated: '2/18/2025', tags: ['TypeScript', 'Framework', 'SPA'] },
  { name: 'Next.js', version: 'v14.0', category: 'Frontend', license: 'MIT', cost: 'Free', stars: 125000, updated: '3/2/2025', tags: ['React', 'SSR', 'Framework'] },
  { name: 'Node.js', version: 'v20.0', category: 'Runtime', license: 'MIT', cost: 'Free', stars: 112000, updated: '2/25/2025', tags: ['JavaScript', 'Runtime', 'Server'] },
  { name: 'GraphQL', version: 'v16.0', category: 'API', license: 'MIT', cost: 'Free', stars: 15500, updated: '2/20/2025', tags: ['API', 'Query', 'Language'] },
  { name: 'Kubernetes', version: 'v1.29', category: 'DevOps', license: 'Apache-2.0', cost: 'Free', stars: 112000, updated: '3/1/2025', tags: ['Orchestration', 'Container', 'DevOps'] },
  { name: 'TensorFlow', version: 'v2.15', category: 'ML', license: 'Apache-2.0', cost: 'Free', stars: 185000, updated: '2/28/2025', tags: ['Machine Learning', 'AI', 'Python'] },
  { name: 'PyTorch', version: 'v2.1.0', category: 'ML', license: 'BSD', cost: 'Free', stars: 75000, updated: '3/3/2025', tags: ['Deep Learning', 'AI', 'Python'] },
  { name: 'Spring Boot', version: 'v3.2.0', category: 'Backend', license: 'Apache-2.0', cost: 'Free', stars: 72000, updated: '2/22/2025', tags: ['Java', 'Framework', 'Backend'] },
];

function WelcomeOnboarding({ username, onGetStarted }) {
  const displayName = username || 'there';

  return (
    <div className="welcome-onboarding">
      <div className="floating-cards-container">
        {sampleLibraries.map((lib, index) => {
          const verticalPosition = 2 + (index * 6) % 90; 
          const animationDuration = 20 + (index % 5) * 2; 
          const animationDelay = index * 0.8; 
          
          const layoutStyle = `layout-${(index % 5) + 1}`;
          
          return (
            <div
              key={index}
              className={`floating-library-card ${layoutStyle}`}
              style={{
                '--animation-delay': `${animationDelay}s`,
                '--animation-duration': `${animationDuration}s`,
                '--start-position': `${verticalPosition}%`,
              }}
            >
              
              {layoutStyle === 'layout-1' && (
                <>
                  <div className="floating-card-title-section">
                    <h3 className="floating-card-title-large">{lib.name}</h3>
                    <div className="floating-card-version-box">{lib.version}</div>
                  </div>
                  <div className="floating-card-details-vertical">
                    <div className="floating-card-detail-item">
                      <span className="floating-card-label-left">Category</span>
                      <span className="floating-card-value-right">{lib.category}</span>
                    </div>
                    <div className="floating-card-detail-item">
                      <span className="floating-card-label-left">License</span>
                      <span className="floating-card-value-right">{lib.license}</span>
                    </div>
                    <div className="floating-card-detail-item">
                      <span className="floating-card-label-left">Stars</span>
                      <span className="floating-card-value-right">{lib.stars.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="floating-card-tags-bottom">
                    {lib.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="floating-card-tag-pill">{tag}</span>
                    ))}
                  </div>
                </>
              )}

              
              {layoutStyle === 'layout-2' && (
                <>
                  <div className="floating-card-compact-header">
                    <h3 className="floating-card-title">{lib.name}</h3>
                    <span className="floating-card-version">{lib.version}</span>
                  </div>
                  <div className="floating-card-compact-body">
                    <div className="floating-card-compact-left">
                      <span className="floating-card-category-badge">{lib.category}</span>
                      <span className="floating-card-stars-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        {(lib.stars / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="floating-card-compact-right">
                      <span className="floating-card-license-badge">{lib.license}</span>
                    </div>
                  </div>
                </>
              )}

              
              {layoutStyle === 'layout-3' && (
                <>
                  <div className="floating-card-tag-header">
                    <h3 className="floating-card-title">{lib.name}</h3>
                  </div>
                  <div className="floating-card-tag-body">
                    <div className="floating-card-tags-large">
                      {lib.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="floating-card-tag-large">{tag}</span>
                      ))}
                    </div>
                    <div className="floating-card-tag-footer">
                      <span className="floating-card-stars-compact">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        {lib.stars.toLocaleString()}
                      </span>
                      <span className="floating-card-version-small">{lib.version}</span>
                    </div>
                  </div>
                </>
              )}

              
              {layoutStyle === 'layout-4' && (
                <>
                  <div className="floating-card-minimal-header">
                    <h3 className="floating-card-title-minimal">{lib.name}</h3>
                    <div className="floating-card-minimal-meta">
                      <span className="floating-card-category-minimal">{lib.category}</span>
                      <span className="floating-card-dot">•</span>
                      <span className="floating-card-license-minimal">{lib.license}</span>
                    </div>
                  </div>
                  <div className="floating-card-minimal-stats">
                    <div className="floating-card-stat-item">
                      <span className="floating-card-stat-label">Stars</span>
                      <span className="floating-card-stat-value">{(lib.stars / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="floating-card-stat-item">
                      <span className="floating-card-stat-label">Cost</span>
                      <span className="floating-card-stat-value">{lib.cost}</span>
                    </div>
                  </div>
                </>
              )}

              
              {layoutStyle === 'layout-5' && (
                <>
                  <div className="floating-card-vertical-header">
                    <h3 className="floating-card-title">{lib.name}</h3>
                    <span className="floating-card-version">{lib.version}</span>
                  </div>
                  <div className="floating-card-vertical-divider"></div>
                  <div className="floating-card-vertical-content">
                    <div className="floating-card-vertical-item">
                      <span className="floating-card-label-small">Category</span>
                      <span className="floating-card-value-small">{lib.category}</span>
                    </div>
                    <div className="floating-card-vertical-item">
                      <span className="floating-card-label-small">License</span>
                      <span className="floating-card-value-small">{lib.license}</span>
                    </div>
                    <div className="floating-card-vertical-item">
                      <span className="floating-card-label-small">Stars</span>
                      <span className="floating-card-value-small">{lib.stars.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="floating-card-tags-compact">
                    {lib.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span key={tagIndex} className="floating-card-tag-compact">{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="welcome-onboarding-content">
        <div className="welcome-header">
          <h1 className="welcome-greeting">Hi, {displayName}!</h1>
        </div>

        <div className="welcome-main">
          <h2 className="welcome-title">
            Build smarter. Ship faster Your Products. This tool provides you library insights that can be used for your projects.
          </h2>

          <p className="welcome-description">
            Make confident decisions with data-driven analysis of performance, security, community activity, and ecosystem health. Explore curated recommendations tailored to your stack and compare options with clarity.
          </p>

          <div className="features-section">
            <h3 className="features-title">What you can do here:</h3>
            <ul className="features-list">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span>Search and filter across thousands of libraries</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Get AI-curated recommendations based on your stack</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Compare libraries side-by-side to evaluate trade-offs</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Save libraries to your wishlist for later review</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Add libraries into your projects to build your tech stack</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>View insights on popularity, maintenance, and risk level</span>
              </li>
            </ul>
          </div>

          <button className="lets-go-btn" onClick={onGetStarted}>
            Let's go
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeOnboarding;

