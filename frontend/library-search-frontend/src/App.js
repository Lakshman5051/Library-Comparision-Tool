import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Components
import Header from './Components/Header/Header';
import Login from './Components/Login/Login';
import UserBadge from './Components/UserBadge/UserBadge';

function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Core Data State
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // AUTHENTICATION HANDLERS
  // ============================================
  
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    setShowWelcome(true);
    
    // Hide welcome message after 3 seconds
    setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    
    // Fetch real data from backend after login
    fetchAllLibraries();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLibraries([]);
    setSelectedLibraries([]);
    handleResetFilters();
  };

  // ============================================
  // DATA FETCHING (FROM BACKEND API)
  // ============================================
  
  const fetchAllLibraries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/libraries');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLibraries(data);
    } catch (err) {
      setError('Failed to fetch libraries. Please ensure your backend is running.');
      console.error('Error fetching libraries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FILTERING & SORTING LOGIC
  // ============================================
  
  const filteredLibraries = useMemo(() => {
    let result = [...libraries];

    if (searchQuery.trim()) {
      result = result.filter(lib =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      result = result.filter(lib => lib.category === categoryFilter);
    }

    if (platformFilter) {
      result = result.filter(lib => lib.packageManager === platformFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return (b.githubStars || 0) - (a.githubStars || 0);
        case 'downloads':
          return (b.downloadsLast30Days || 0) - (a.downloadsLast30Days || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.lastCommitDate || 0) - new Date(a.lastCommitDate || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [libraries, searchQuery, categoryFilter, platformFilter, sortBy]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const uniqueCategories = useMemo(() => {
    return [...new Set(libraries.map(lib => lib.category).filter(Boolean))];
  }, [libraries]);

  const uniquePlatforms = useMemo(() => {
    return [...new Set(libraries.map(lib => lib.packageManager).filter(Boolean))];
  }, [libraries]);

  const handleSelectLibrary = (library) => {
    if (selectedLibraries.find(lib => lib.id === library.id)) {
      setSelectedLibraries(selectedLibraries.filter(lib => lib.id !== library.id));
    } else if (selectedLibraries.length < 3) {
      setSelectedLibraries([...selectedLibraries, library]);
    } else {
      alert('You can compare up to 3 libraries at a time');
    }
  };

  const handleRemoveLibrary = (libraryId) => {
    setSelectedLibraries(selectedLibraries.filter(lib => lib.id !== libraryId));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPlatformFilter('');
    setSortBy('stars');
  };

  // ============================================
  // RENDER - LOGIN SCREEN
  // ============================================
  
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ============================================
  // RENDER - MAIN APPLICATION
  // ============================================
  
  return (
    <div className="app">
      {/* Welcome Notification */}
      {showWelcome && (
        <div className="welcome-notification">
          <div className="welcome-content">
            <span className="welcome-icon">🎉</span>
            <div className="welcome-text">
              <strong>Welcome back, {currentUser.username}!</strong>
              <p>Logged in as {currentUser.role.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Component */}
      <Header>
        <UserBadge user={currentUser} onLogout={handleLogout} />
      </Header>

      {/* Main Content Container */}
      <main className="main-content">
        
        {/* INLINE SEARCH BAR */}
        <section className="search-section">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search libraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-results">
              Showing {filteredLibraries.length} of {libraries.length} libraries
            </span>
          </div>
        </section>

        {/* INLINE FILTER PANEL */}
        <section className="filter-section">
          <div className="filter-panel">
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Platform:</label>
              <select 
                value={platformFilter} 
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="">All Platforms</option>
                {uniquePlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="stars">Most Stars</option>
                <option value="downloads">Most Downloads</option>
                <option value="name">Name (A-Z)</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>

            <button className="reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </section>

        {/* INLINE LIBRARY SELECTOR (when libraries selected) */}
        {selectedLibraries.length > 0 && (
          <section className="selector-section">
            <div className="selected-libraries">
              <h3>Selected for Comparison ({selectedLibraries.length}/3)</h3>
              <div className="selected-grid">
                {selectedLibraries.map(lib => (
                  <div key={lib.id} className="selected-card">
                    <span>{lib.name}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveLibrary(lib.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* COMPARISON VIEW OR LIBRARY LIST */}
        {selectedLibraries.length >= 2 ? (
          <section className="comparison-section">
            <h2>Comparison View</h2>
            <div className="comparison-grid">
              {selectedLibraries.map(lib => (
                <div key={lib.id} className="comparison-card">
                  <h3>{lib.name}</h3>
                  <div className="comparison-stats">
                    <div className="stat">
                      <span className="label">Stars:</span>
                      <span className="value">{lib.githubStars?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Downloads:</span>
                      <span className="value">{lib.downloadsDisplay || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Category:</span>
                      <span className="value">{lib.category || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Platform:</span>
                      <span className="value">{lib.packageManager || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Grade:</span>
                      <span className="value">{lib.qualityGrade || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="library-list-section">
            {isLoading ? (
              <div className="loading-state">
                <p>Loading libraries...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchAllLibraries}>Retry</button>
              </div>
            ) : filteredLibraries.length === 0 ? (
              <div className="empty-state">
                <p>No libraries found matching your criteria.</p>
                <button onClick={handleResetFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="library-grid">
                {filteredLibraries.map(library => (
                  <div 
                    key={library.id} 
                    className={`library-card ${selectedLibraries.find(lib => lib.id === library.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectLibrary(library)}
                  >
                    <h3>{library.name}</h3>
                    <p className="description">{library.description}</p>
                    <div className="library-stats">
                      <span>⭐ {library.githubStars?.toLocaleString() || 'N/A'}</span>
                      <span>📦 {library.downloadsDisplay || 'N/A'}</span>
                    </div>
                    <div className="library-badges">
                      <span className="badge">{library.packageManager}</span>
                      {library.qualityGrade && (
                        <span className="badge grade">{library.qualityGrade}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* INLINE FOOTER */}
      <footer className="footer">
        <p>Library Comparator Application ©Lakshman</p>
      </footer>
    </div>
  );
}

export default App;