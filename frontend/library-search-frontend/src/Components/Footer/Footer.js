import React from 'react';

function Footer({ onHome, onAboutUs, onTerms, onPrivacy }) {
  const currentYear = new Date().getFullYear();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onHome) {
      onHome();
    }
  };

  const handleAboutUsClick = (e) => {
    e.preventDefault();
    if (onAboutUs) {
      onAboutUs();
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    if (onTerms) {
      onTerms();
    }
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    if (onPrivacy) {
      onPrivacy();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Quick Links Section */}
        <div className="footer-section">
          <h4 className="footer-section-title">Quick Links</h4>
          <div className="footer-links">
            <a href="#home" onClick={handleHomeClick}>Home</a>
            <a href="#about" onClick={handleAboutUsClick}>About Us</a>
          </div>
        </div>

        {/* Legal Section */}
        <div className="footer-section">
          <h4 className="footer-section-title">Legal</h4>
          <div className="footer-links">
            <a href="#terms" onClick={handleTermsClick}>Terms of Service</a>
            <a href="#privacy" onClick={handlePrivacyClick}>Privacy Policy</a>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="footer-section footer-contact">
          <h4 className="footer-section-title">Contact Us</h4>
          <div className="contact-item">
            <div className="contact-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>Email</span>
              <a href="mailto:developers.intellib@gmail.com" className="contact-value">
                developers.intellib@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* GitHub Section */}
        <div className="footer-section">
          <h4 className="footer-section-title">GitHub</h4>
          <div className="footer-links">
            <a href="https://github.com/Lakshman5051/Library-Comparision-Tool" target="_blank" rel="noopener noreferrer" className="github-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Repository
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} IntelliLib by Lakshman. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
