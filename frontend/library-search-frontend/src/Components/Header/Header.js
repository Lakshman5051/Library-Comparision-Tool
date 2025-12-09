import React, { useState, useEffect } from 'react';
import './Header.css';

function Header({ children, onHome, isLoggedIn, currentUser, onLogin, onSignup, onProjects, onSearchLibraries, onViewFavorites, hideNav }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-logo" onClick={onHome} style={{ cursor: onHome ? 'pointer' : 'default' }}>
            IntelliLib
          </h1>
        </div>
        
        <div className="header-right">
          {!isLoggedIn ? (
            /* Public landing page - all items on right */
              <div className="header-nav-right">
              <button className="nav-item-minimal" onClick={onLogin}>
                <span>Login</span>
              </button>
              <button className="signup-btn" onClick={onSignup}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Sign Up</span>
              </button>
            </div>
          ) : hideNav ? (
            <div className="user-section">
              {children}
            </div>
          ) : (
            <>
              {/* show full nav when not hidden */}
              <nav className="header-nav-full">
                <button className="nav-item" onClick={onHome}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Home</span>
                </button>
                <button className="nav-item" onClick={() => onSearchLibraries && onSearchLibraries()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="6"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Search Libraries</span>
                </button>
                <button className="nav-item" onClick={() => onViewFavorites && onViewFavorites()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  <span>Favorites</span>
                </button>
                <button className="nav-item" onClick={() => onProjects && onProjects()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7a1 1 0 011-1h4l2 2h8a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V7z"></path>
                  </svg>
                  <span>My Projects</span>
                </button>
                {currentUser?.role === 'ADMIN' && (
                  <button className="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m5.7-13.8l-4.2 4.2m0 3.2l-4.2 4.2m11.3-5.7h-6m-6 0H1m13.8 5.7l-4.2-4.2m0-3.2l-4.2-4.2"/>
                    </svg>
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </nav>
              <div className="user-section">
                {children}
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;