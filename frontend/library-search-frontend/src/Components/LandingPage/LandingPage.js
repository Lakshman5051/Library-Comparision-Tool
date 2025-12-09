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

      {/* Team Section */}
      <section className="mentors-section">
        <div className="mentors-header">
          <div className="section-badge">Meet Our Team</div>
          <h2 className="mentors-title">Built by Passionate Developers</h2>
          <p className="mentors-description">
            Our project is developed and guided by experienced professionals who bring valuable insights and expertise.
          </p>
        </div>

        <div className="mentors-grid">
          {/* Person 1: Lakshman */}
          <div className="mentor-card">
            <div className="mentor-avatar">
              <div className="avatar-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <h3 className="mentor-name">Lakshman Babu Telagamsetti</h3>
            <p className="mentor-role">FOUNDER & LEAD DEVELOPER</p>
            <p className="mentor-bio">
              MPS Software Engineering Graduate Student. Built and maintained the entire IntelliLib Library Tool.
            </p>
            <div className="mentor-contact">
              <a href="mailto:developers.intellib@gmail.com" className="contact-link" title="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href="https://github.com/Lakshman5051/Library-Comparision-Tool" target="_blank" rel="noopener noreferrer" className="contact-link" title="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Person 2: Dr. Mohammad Samarah */}
          <div className="mentor-card">
            <div className="mentor-avatar">
              <div className="avatar-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <h3 className="mentor-name">Dr. Mohammad Samarah</h3>
            <p className="mentor-role">PROJECT ADVISOR</p>
            <p className="mentor-bio">
              Project Sponsor providing academic guidance and project oversight for IntelliLib.
            </p>
            <div className="mentor-contact">
              <a href="mailto:developers.intellib@gmail.com" className="contact-link" title="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Person 3: Dr. Melissa Sahl */}
          <div className="mentor-card">
            <div className="mentor-avatar">
              <div className="avatar-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <h3 className="mentor-name">Dr. Melissa Sahl</h3>
            <p className="mentor-role">PROJECT ADVISOR</p>
            <p className="mentor-bio">
              Project Sponsor providing technical guidance and strategic direction for IntelliLib.
            </p>
            <div className="mentor-contact">
              <a href="mailto:developers.intellib@gmail.com" className="contact-link" title="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/melissatronic/" target="_blank" rel="noopener noreferrer" className="contact-link" title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
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