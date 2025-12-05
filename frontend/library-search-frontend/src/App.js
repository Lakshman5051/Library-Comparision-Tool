import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Header from './Components/Header/Header';
import Login from './Components/Login/Login';
import UserBadge from './Components/UserBadge/UserBadge';
import LibraryDetails from './Components/LibraryDetails/LibraryDetails';
import Signup from './Components/Signup/Signup';

// Services
import { logout, getCurrentUser } from './Services/authService';

function App() {

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // state management
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  // Core Data State
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  
  // Detail View State
  const [selectedLibraryForDetails, setSelectedLibraryForDetails] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  // default sort is empty so page doesn't auto-sort — user can choose
  const [sortBy, setSortBy] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Advanced Search State
const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
const [selectedCategories, setSelectedCategories] = useState([]);
const [selectedPlatforms, setSelectedPlatforms] = useState([]);
const [starRange, setStarRange] = useState({ min: '', max: '' });
const [dependentsRange, setDependentsRange] = useState({ min: '', max: '' });
const [lastCommitMonths, setLastCommitMonths] = useState('');
const [includeGrades, setIncludeGrades] = useState(['A', 'B', 'C', 'D', 'F']);
const [excludeDeprecated, setExcludeDeprecated] = useState(false);
const [excludeSecurityIssues, setExcludeSecurityIssues] = useState(false);
const [excludeUnmaintained, setExcludeUnmaintained] = useState(false);

  // Auth Handlers
  
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

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear frontend state
      setIsLoggedIn(false);
      setCurrentUser(null);
      setLibraries([]);
      setSelectedLibraries([]);
      handleResetFilters();
    }
  };

  const handleOpenSignup = () => setShowSignup(true);
  const handleCloseSignup = () => setShowSignup(false);

  const handleSignupSubmit = (payload) => {
    // Demo behavior: log payload and show a small alert
    console.log('Signup payload (demo):', payload);
    alert('Account created (demo). You can now log in.');
  };

  // Fetching Layer
  
  const fetchAllLibraries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/libraries`);
      
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

  
  const formatDependents = (count) => {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  // sorting logic
  
 const filteredLibraries = useMemo(() => {
  let result = [...libraries];

  if (searchQuery.trim()) {
    result = result.filter(lib =>
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lib.description && lib.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // UPDATED: Category filter with multi-category support
  if (categoryFilter) {
    result = result.filter(lib => {
      if (lib.category === categoryFilter) return true;
      if (lib.categories && lib.categories.includes(categoryFilter)) return true;
      return false;
    });
  }

  if (platformFilter) {
    result = result.filter(lib => lib.packageManager === platformFilter);
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return (b.githubStars || 0) - (a.githubStars || 0);
      case 'dependents':
        return (b.dependentProjectsCount || 0) - (a.dependentProjectsCount || 0);
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

    
 // Get all unique categories (including from multi-category libraries)
const uniqueCategories = useMemo(() => {
  const categorySet = new Set();
  
  libraries.forEach(lib => {
    // Add primary category
    if (lib.category) {
      categorySet.add(lib.category);
    }
    
    // Add all categories from the categories string
    if (lib.categories) {
      lib.categories.split(',').forEach(cat => {
        const trimmed = cat.trim();
        if (trimmed) categorySet.add(trimmed);
      });
    }
  });
  
  // Convert to sorted array
  return Array.from(categorySet).sort();
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

  const handleViewDetails = (library, event) => {
    event.stopPropagation(); // Prevent card selection
    setSelectedLibraryForDetails(library);
  };

  const handleCloseDetails = () => {
    setSelectedLibraryForDetails(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPlatformFilter('');
    setSortBy('');
  };

  // Toggle category selection (multi-select)
const handleCategoryToggle = (category) => {
  if (selectedCategories.includes(category)) {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  } else {
    setSelectedCategories([...selectedCategories, category]);
  }
};

// Toggle platform selection (multi-select)
const handlePlatformToggle = (platform) => {
  if (selectedPlatforms.includes(platform)) {
    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
  } else {
    setSelectedPlatforms([...selectedPlatforms, platform]);
  }
};

// Toggle grade selection
const handleGradeToggle = (grade) => {
  if (includeGrades.includes(grade)) {
    setIncludeGrades(includeGrades.filter(g => g !== grade));
  } else {
    setIncludeGrades([...includeGrades, grade]);
  }
};

// Advanced Search API call
const handleAdvancedSearch = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Build search criteria
    const criteria = {
      searchQuery: searchQuery || null,
      categories: selectedCategories.length > 0 ? selectedCategories : null,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : null,
      minStars: starRange.min ? parseInt(starRange.min) : null,
      maxStars: starRange.max ? parseInt(starRange.max) : null,
      minDependents: dependentsRange.min ? parseInt(dependentsRange.min) : null,
      maxDependents: dependentsRange.max ? parseInt(dependentsRange.max) : null,
      lastCommitAfter: lastCommitMonths ? 
        new Date(Date.now() - lastCommitMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      includeGrades: includeGrades.length > 0 ? includeGrades : null,
      excludeDeprecated: excludeDeprecated,
      excludeSecurityVulnerabilities: excludeSecurityIssues,
      excludeUnmaintained: excludeUnmaintained,
      sortBy: sortBy
    };
    
    // Call backend API
    const response = await fetch(`${API_URL}/api/libraries/advanced-search`,
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criteria)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setLibraries(data);
  } catch (err) {
    setError('Advanced search failed: ' + err.message);
    console.error('Error in advanced search:', err);
  } finally {
    setIsLoading(false);
  }
};

// Reset advanced filters
const handleResetAdvancedFilters = () => {
  setSelectedCategories([]);
  setSelectedPlatforms([]);
  setStarRange({ min: '', max: '' });
  setDependentsRange({ min: '', max: '' });
  setLastCommitMonths('');
  setIncludeGrades(['A', 'B', 'C', 'D', 'F']);
  setExcludeDeprecated(false);
  setExcludeSecurityIssues(false);
  setExcludeUnmaintained(false);
  setSearchQuery('');
  setSortBy('');
  fetchAllLibraries(); // Back to showing all
};

  // login screen
  
  if (!isLoggedIn) {
    return <>
      <Login onLogin={handleLogin} onSignup={handleOpenSignup} />
      {showSignup && (
        <React.Suspense fallback={null}>
          {/* Lazy simple signup modal */}
          <Signup onClose={handleCloseSignup} onSubmit={handleSignupSubmit} />
        </React.Suspense>
      )}
    </>;
  }

  // welcome notification
  
  return (
    <div className="app">
      {/* Welcome Notification */}
      {showWelcome && (
        <div className="welcome-notification">
          <div className="welcome-content">
            <div className="welcome-text">
              <strong>Hey, {currentUser.username}!</strong>
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
        {/* INLINE FILTER PANEL WITH ADVANCED SEARCH */}
<section className="filter-section">
  <div className="filter-panel">
    
    {/* Basic Filters (Always Visible) */}
    <div className="basic-filters">
      <div className="filter-group">
        <label>Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All</option>
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
          <option value="">All</option>
          {uniquePlatforms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Default</option>
          <option value="stars">Most Stars</option>
          <option value="dependents">Most Used</option>
          <option value="name">Name (A-Z)</option>
          <option value="updated">Recently Updated</option>
        </select>
      </div>

      <button 
        className="advanced-toggle-btn" 
        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
      >
        {showAdvancedSearch ? '▲ Hide' : '▼ Show'} Advanced Search
      </button>

      <button className="reset-btn" onClick={handleResetAdvancedFilters}>
        Reset All
      </button>
    </div>

    {/* Advanced Search Panel (Collapsible) */}
    {showAdvancedSearch && (
      <div className="advanced-search-panel">
        
        {/* Multiple Categories */}
        <div className="filter-group-advanced">
          <label>Categories (select multiple):</label>
          <div className="checkbox-grid">
            {uniqueCategories.map(cat => (
              <label key={cat} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Multiple Platforms */}
        <div className="filter-group-advanced">
          <label>Platforms (select multiple):</label>
          <div className="checkbox-grid">
            {uniquePlatforms.map(platform => (
              <label key={platform} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform)}
                  onChange={() => handlePlatformToggle(platform)}
                />
                {platform}
              </label>
            ))}
          </div>
        </div>

        {/* Star Range */}
        <div className="filter-group-advanced">
          <label>GitHub Stars Range:</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={starRange.min}
              onChange={(e) => setStarRange({...starRange, min: e.target.value})}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={starRange.max}
              onChange={(e) => setStarRange({...starRange, max: e.target.value})}
            />
          </div>
        </div>

        {/* Dependents Range */}
        <div className="filter-group-advanced">
          <label>Dependents Range:</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={dependentsRange.min}
              onChange={(e) => setDependentsRange({...dependentsRange, min: e.target.value})}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={dependentsRange.max}
              onChange={(e) => setDependentsRange({...dependentsRange, max: e.target.value})}
            />
          </div>
        </div>

        {/* Last Commit Filter */}
        <div className="filter-group-advanced">
          <label>Last Commit Within:</label>
          <select 
            value={lastCommitMonths} 
            onChange={(e) => setLastCommitMonths(e.target.value)}
          >
            <option value="">Any time</option>
            <option value="1">1 month</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">1 year</option>
          </select>
        </div>

        {/* Quality Grades */}
        <div className="filter-group-advanced">
          <label>Include Quality Grades:</label>
          <div className="checkbox-grid-inline">
            {['A', 'B', 'C', 'D', 'F'].map(grade => (
              <label key={grade} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeGrades.includes(grade)}
                  onChange={() => handleGradeToggle(grade)}
                />
                Grade {grade}
              </label>
            ))}
          </div>
        </div>

        {/* Exclude Options */}
        <div className="filter-group-advanced">
          <label>Exclude:</label>
          <div className="checkbox-grid-inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={excludeDeprecated}
                onChange={(e) => setExcludeDeprecated(e.target.checked)}
              />
              Deprecated Libraries
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={excludeSecurityIssues}
                onChange={(e) => setExcludeSecurityIssues(e.target.checked)}
              />
              Security Vulnerabilities
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={excludeUnmaintained}
                onChange={(e) => setExcludeUnmaintained(e.target.checked)}
              />
              Unmaintained (no commits in 6 months)
            </label>
          </div>
        </div>

        {/* Search Button */}
        <div className="advanced-search-actions">
          <button className="search-btn" onClick={handleAdvancedSearch}>
            🔍 Search with Filters
          </button>
          <button className="reset-btn" onClick={handleResetAdvancedFilters}>
            Clear All Filters
          </button>
        </div>

      </div>
    )}
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
                      <span className="label">GitHub Stars:</span>
                      <span className="value">{lib.githubStars?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Used By:</span>
                      <span className="value">
                        {formatDependents(lib.dependentProjectsCount)} repositories
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Forks:</span>
                      <span className="value">{lib.githubForks?.toLocaleString() || 'N/A'}</span>
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
                      <span className="label">Quality Grade:</span>
                      <span className="value badge-grade">{lib.qualityGrade || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Active Maintenance:</span>
                      <span className="value">{lib.activelyMaintained ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Latest Version:</span>
                      <span className="value">{lib.latestVersion || 'N/A'}</span>
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
                      <span>🔗 {formatDependents(library.dependentProjectsCount)} repos</span>
                    </div>
                    <div className="library-badges">
                      <span className="badge">{library.packageManager}</span>
                      {library.qualityGrade && (
                        <span className="badge grade">{library.qualityGrade}</span>
                      )}
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={(e) => handleViewDetails(library, e)}
                    >
                      📋 View Details
                    </button>
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

      {/* Library Details Modal */}
      {selectedLibraryForDetails && (
        <LibraryDetails 
          library={selectedLibraryForDetails} 
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

// Wrap App with GoogleOAuthProvider
function AppWithGoogleOAuth() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!GOOGLE_CLIENT_ID) {
    console.error('REACT_APP_GOOGLE_CLIENT_ID is not set in environment variables');
    return <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Configuration Error</h2>
      <p>Google Client ID is not configured. Please check your .env file.</p>
    </div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
}

export default AppWithGoogleOAuth;