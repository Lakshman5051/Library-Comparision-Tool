import React from 'react';
import './LandingPage.css';

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="star-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Intelligent Library Discovery Engine
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="star-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>

          <h1 className="hero-title">
          Upgrade Your Stack<br />
            with the Best<br />
            <span className="highlight">Libraries</span>  
          </h1>

          <p className="hero-description">
            Analyze popularity trends, security risks, version stability, and community strength. 
            All in one unified dashboard. Make confident decisions and upgrade your stack with 
            battle-tested libraries.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={onGetStarted}>
              Search Libraries
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary" onClick={onGetStarted}>
              Project Workspace
            </button>
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-value">2,000+</div>
              <div className="stat-label">Libraries Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50+</div>
              <div className="stat-label">Key Metrics Tracked</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5M+</div>
              <div className="stat-label">Data Points Collected</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Real-time</div>
              <div className="stat-label">Updates Daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <div className="section-badge">Powerful Features</div>
          <h2 className="features-title">Everything You Need to Make Informed Decisions</h2>
          <p className="features-description">
            Our platform offers a comprehensive suite of tools to help you find, compare, and choose
            the perfect libraries for your projects.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="feature-title">Advanced Search</h3>
            <p className="feature-description">
              Search by name, category, or operating system with our powerful partial and fuzzy search capabilities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h3 className="feature-title">Visual Comparisons</h3>
            <p className="feature-description">
              Compare libraries side-by-side with intuitive scorecards that highlight key differences.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h7a4 4 0 014 4v14a3 3 0 00-3-3H3z"/>
                <path d="M21 3h-7a4 4 0 00-4 4v14a3 3 0 013-3h8z"/>
              </svg>
            </div>
            <h3 className="feature-title">Comprehensive Data</h3>
            <p className="feature-description">
              Access detailed information about versions, dependencies, security vulnerabilities, and more for thousands of libraries.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3 className="feature-title">Example Code Snippets</h3>
            <p className="feature-description">
              View real-world usage examples and integration patterns to help you get started quickly.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="feature-title">Security Analysis</h3>
            <p className="feature-description">
              Stay informed about security vulnerabilities and deprecated libraries to maintain safe projects.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="feature-title">Maintenance Tracking</h3>
            <p className="feature-description">
              Monitor library activity with last commit dates and maintenance status to ensure long-term viability.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Find Your Perfect Library?</h2>
          <p className="cta-description">
            Start comparing thousands of libraries today and make better technology decisions for your projects.
          </p>
          <button className="btn-cta" onClick={onGetStarted}>
            Get Started Now
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;