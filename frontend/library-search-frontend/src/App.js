import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Header from './Components/Header/Header';
import Login from './Components/Login/Login';
import UserBadge from './Components/UserBadge/UserBadge';
import LibraryDetails from './Components/LibraryDetails/LibraryDetails';
import Signup from './Components/Signup/Signup';
import ComparisonView from './Components/ComparisonView/ComparisonView';
import LandingPage from './Components/LandingPage/LandingPage';
import Footer from './Components/Footer/Footer';
import AboutUs from './Components/AboutUs/AboutUs';
import TermsOfService from './Components/TermsOfService/TermsOfService';
import PrivacyPolicy from './Components/PrivacyPolicy/PrivacyPolicy';
import WelcomeOnboarding from './Components/WelcomeOnboarding/WelcomeOnboarding';
import UserDashboard from './Components/UserDashboard/UserDashboard';
import AccountManagement from './Components/AccountManagement/AccountManagement';

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  
  // Core Data State
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  const [comparisonCategory, setComparisonCategory] = useState(null); // Track category for comparison
  const [showComparisonView, setShowComparisonView] = useState(false);

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
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // When user presses back button, return to landing page
      if (!isLoggedIn) {
        setShowLandingPage(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLoggedIn]);

  // Auth Handlers
  
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    
    // Check if this is a new user (first signup)
    if (userData.isNewUser) {
      // Show onboarding for new users
      setShowOnboarding(true);
      // Don't show dashboard yet - wait for "Let's go" button
    } else {
      // Existing users - show dashboard directly
      setShowDashboard(true);
      setShowLibrarySearch(false);
    }
  };

  const handleOnboardingGetStarted = () => {
    // User clicked "Let's go" - hide onboarding and show dashboard
    setShowOnboarding(false);
    setShowDashboard(true);
    setShowLibrarySearch(false);
  };

  const handleDashboardSearchLibraries = () => {
    // User clicked "Search Libraries" - show library search and fetch data
    setShowDashboard(false);
    setShowLibrarySearch(true);
    fetchAllLibraries();
  };

  const handleDashboardCreateProject = () => {
    // TODO: Implement create project functionality
    alert('Create Project feature coming soon!');
  };

  const handleDashboardViewFavorites = () => {
    // TODO: Implement favorites view
    alert('Favorites feature coming soon!');
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
      setShowDashboard(false);
      setShowLibrarySearch(false);
      setShowOnboarding(false);
      setShowAccountManagement(false);
      handleResetFilters();
      // Redirect to landing page
      setShowLandingPage(true);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenSignup = () => setShowSignup(true);
  const handleCloseSignup = () => setShowSignup(false);

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
    // Check if library is already selected
    if (selectedLibraries.find(lib => lib.id === library.id)) {
      // Remove from selection
      const updatedLibraries = selectedLibraries.filter(lib => lib.id !== library.id);
      setSelectedLibraries(updatedLibraries);

      // Reset comparison category if no libraries selected
      if (updatedLibraries.length === 0) {
        setComparisonCategory(null);
      }
      return;
    }

    // If this is the first library, set the comparison category
    if (selectedLibraries.length === 0) {
      setSelectedLibraries([library]);
      setComparisonCategory(library.category);
      return;
    }

    // Check if library matches the comparison category
    if (comparisonCategory && library.category !== comparisonCategory) {
      alert(`Please select libraries from the same category. Current comparison category: ${comparisonCategory}`);
      return;
    }

    // Add to selection (no limit)
    setSelectedLibraries([...selectedLibraries, library]);
  };

  const handleRemoveLibrary = (libraryId) => {
    const updatedLibraries = selectedLibraries.filter(lib => lib.id !== libraryId);
    setSelectedLibraries(updatedLibraries);

    // Reset comparison category if no libraries selected
    if (updatedLibraries.length === 0) {
      setComparisonCategory(null);
      setShowComparisonView(false);
    }
  };

  const handleClearComparison = () => {
    setSelectedLibraries([]);
    setComparisonCategory(null);
    setShowComparisonView(false);
  };

  const handleViewComparison = () => {
    if (selectedLibraries.length < 2) {
      alert('Please select at least 2 libraries to compare');
      return;
    }
    setShowComparisonView(true);
  };

  const handleCloseComparisonView = () => {
    setShowComparisonView(false);
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

  // Handler for getting started from landing page (triggers login)
  const handleGetStarted = () => {
    // If not logged in, this will show the login form
    // If logged in, navigate to the library explorer
    if (!isLoggedIn) {
      setShowLandingPage(false);
    } else {
      setShowLandingPage(false);
      fetchAllLibraries();
    }
  };

  // Handler to go back to dashboard (for logged in users) or landing page (for non-logged in)
  const handleGoHome = () => {
    if (isLoggedIn) {
      // Logged in users go to dashboard
      setShowLandingPage(false);
      setShowLibrarySearch(false);
      setShowDashboard(true);
    } else {
      // Non-logged in users go to landing page
      setShowLandingPage(true);
    }
    setSelectedLibraries([]);
    setComparisonCategory(null);
    setShowComparisonView(false);
    setShowAboutUs(false);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAboutUs = () => {
    setShowAboutUs(true);
    setShowLandingPage(false);
  };

  const handleBackFromAboutUs = () => {
    setShowAboutUs(false);
    setShowLandingPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowTerms = () => {
    setShowTermsModal(true);
  };

  const handleShowPrivacy = () => {
    setShowPrivacyModal(true);
  };

  // Handler to show login from header
  const handleShowLogin = () => {
    setShowLandingPage(false);
    setShowSignup(false);
    // Add to browser history
    window.history.pushState({ page: 'login' }, 'Login', '#login');
  };

  // Handler to show signup from header
  const handleShowSignup = () => {
    setShowLandingPage(false);
    setShowSignup(true);
    // Add to browser history
    window.history.pushState({ page: 'signup' }, 'Sign Up', '#signup');
  };

  // Handler to go back to landing page
  const handleBackToLanding = () => {
    setShowLandingPage(true);
    setShowSignup(false);
    // Go back in browser history
    window.history.back();
  };

  // Show About Us page
  if (showAboutUs) {
    return (
      <div className="app">
        <AboutUs onBack={handleBackFromAboutUs} />
        <Footer 
          onHome={handleGoHome}
          onAboutUs={handleShowAboutUs}
          onTerms={handleShowTerms}
          onPrivacy={handleShowPrivacy}
        />
        {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
        {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
      </div>
    );
  }

  // Show landing page FIRST (before login)
  if (!isLoggedIn && showLandingPage) {
    return (
      <div className="app">
        {/* Header Component without navigation */}
        <Header 
          onHome={handleGoHome}
          isLoggedIn={false}
          currentUser={null}
          onLogin={handleShowLogin}
          onSignup={handleShowSignup}
        />
        <LandingPage onGetStarted={handleGetStarted} />
        <Footer 
          onHome={handleGoHome}
          onAboutUs={handleShowAboutUs}
          onTerms={handleShowTerms}
          onPrivacy={handleShowPrivacy}
        />
        {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
        {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
      </div>
    );
  }
  
  // Show login screen when user clicks login
  if (!isLoggedIn) {
    return <>
      <Login 
        onLogin={handleLogin} 
        onSignup={handleOpenSignup}
        onBack={handleBackToLanding}
      />
      {showSignup && (
        <React.Suspense fallback={null}>
          {/* Signup modal with real backend integration */}
          <Signup 
            onClose={handleCloseSignup} 
            onLogin={handleLogin}
            onTerms={handleShowTerms}
            onPrivacy={handleShowPrivacy}
            onBackToHome={handleBackToLanding}
          />
        </React.Suspense>
      )}
      {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
      {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
    </>;
  }

  // Show landing page after login
  if (showLandingPage && isLoggedIn) {
    return (
      <div className="app">
        {/* Header Component */}
        <Header 
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
        >
          <UserBadge user={currentUser} onLogout={handleLogout} />
        </Header>
        <LandingPage onGetStarted={handleGetStarted} />
        <Footer 
          onHome={handleGoHome}
          onAboutUs={handleShowAboutUs}
          onTerms={handleShowTerms}
          onPrivacy={handleShowPrivacy}
        />
        {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
        {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
      </div>
    );
  }

  // Show onboarding for new users (before dashboard)
  if (showOnboarding && isLoggedIn && currentUser) {
    const displayName = currentUser.firstName && currentUser.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser.username || currentUser.email || 'there';
    
    return (
      <WelcomeOnboarding
        username={displayName}
        onGetStarted={handleOnboardingGetStarted}
      />
    );
  }

  // Show User Dashboard
  if (showDashboard && isLoggedIn && currentUser && !showLibrarySearch) {
    return (
      <div className="app">
        <Header 
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
        >
          <UserBadge 
            user={currentUser} 
            onLogout={handleLogout} 
            onAccountSettings={() => setShowAccountManagement(true)} 
          />
        </Header>
        <UserDashboard
          onSearchLibraries={handleDashboardSearchLibraries}
          onCreateProject={handleDashboardCreateProject}
          onViewFavorites={handleDashboardViewFavorites}
        />
        <Footer 
          onHome={handleGoHome}
          onAboutUs={handleShowAboutUs}
          onTerms={handleShowTerms}
          onPrivacy={handleShowPrivacy}
        />
        {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
        {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
        {showAccountManagement && (
          <AccountManagement
            user={currentUser}
            onClose={() => setShowAccountManagement(false)}
            onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}
      </div>
    );
  }

  // Main app view (Library Search)
  return (
    <div className="app">
      {/* Welcome Notification */}
      {showWelcome && (
        <div className="welcome-notification">
          <div className="welcome-content">
            <div className="welcome-text">
              <strong>Hey, {currentUser.firstName && currentUser.lastName 
                ? `${currentUser.firstName} ${currentUser.lastName}` 
                : currentUser.username || currentUser.email}!</strong>
            </div>
          </div>
        </div>
      )}

      {/* Header Component */}
      <Header 
        onHome={handleGoHome}
        isLoggedIn={true}
        currentUser={currentUser}
      >
        <UserBadge user={currentUser} onLogout={handleLogout} onHome={handleGoHome} />
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

        {/* FLOATING COMPARISON BAR (when libraries selected) */}
        {selectedLibraries.length > 0 && (
          <div className="comparison-bar">
            <div className="comparison-bar-content">
              <div className="comparison-bar-header">
                <h3>Comparison Queue ({selectedLibraries.length} libraries)</h3>
                {comparisonCategory && (
                  <span className="comparison-category">Category: {comparisonCategory}</span>
                )}
              </div>
              <div className="comparison-bar-libraries">
                {selectedLibraries.map(lib => (
                  <div key={lib.id} className="comparison-bar-item">
                    <span className="lib-name">{lib.name}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveLibrary(lib.id)}
                      title="Remove from comparison"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="comparison-bar-actions">
                <button
                  className="compare-btn"
                  onClick={handleViewComparison}
                  disabled={selectedLibraries.length < 2}
                >
                  🔍 Compare Now ({selectedLibraries.length})
                </button>
                <button
                  className="clear-btn"
                  onClick={handleClearComparison}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY LIST */}
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
                  {/* Header Section */}
                  <div className="library-card-header">
                    <div className="library-card-title-row">
                      <h3 className="library-card-title-large">{library.name}</h3>
                      {library.latestVersion && (
                        <span className="library-card-version-badge">v{library.latestVersion}</span>
                      )}
                    </div>
                    <div className="library-card-meta-row">
                      {library.lastUpdated && (
                        <span className="library-card-updated">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Updated on {library.lastUpdated}
                        </span>
                      )}
                      {library.githubStars && (
                        <>
                          <span className="library-card-meta-separator">•</span>
                          <span className="library-card-stars">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            {library.githubStars.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {library.description && (
                    <p className="library-card-description">{library.description}</p>
                  )}
                  
                  {/* Key Attributes - Two Columns */}
                  <div className="library-card-attributes">
                    <div className="library-card-attributes-left">
                      {library.category && (
                        <div className="library-card-attribute-item">
                          <span className="library-card-attribute-label">Category:</span>
                          <span className="library-card-attribute-value">{library.category}</span>
                        </div>
                      )}
                      {library.cost && (
                        <div className="library-card-attribute-item">
                          <span className="library-card-attribute-label">Cost:</span>
                          <span className="library-card-attribute-value">{library.cost}</span>
                        </div>
                      )}
                    </div>
                    <div className="library-card-attributes-right">
                      {library.licenseType && (
                        <div className="library-card-attribute-item">
                          <span className="library-card-attribute-label">License:</span>
                          <span className="library-card-attribute-value">{library.licenseType}</span>
                        </div>
                      )}
                      {library.packageManager && (
                        <div className="library-card-attribute-item">
                          <span className="library-card-attribute-label">Platform:</span>
                          <span className="library-card-attribute-value">{library.packageManager}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Compatible With Section */}
                  {(library.supportedOs && library.supportedOs.length > 0) && (
                    <div className="library-card-compatible-section">
                      <span className="library-card-compatible-label">Compatible with:</span>
                      <div className="library-card-compatible-badges">
                        {library.supportedOs.length === 1 && library.supportedOs[0] === 'Cross-platform' ? (
                          <span className="library-card-compatible-badge">Cross-platform</span>
                        ) : (
                          library.supportedOs.slice(0, 3).map((os, osIndex) => (
                            <span key={osIndex} className="library-card-compatible-badge">{os}</span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags Section */}
                  {library.tags && library.tags.length > 0 && (
                    <div className="library-card-tags-section">
                      {library.tags.slice(0, 4).map((tag, tagIndex) => (
                        <span key={tagIndex} className="library-card-tag-badge">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {/* View Details Link */}
                  <button
                    className="view-details-link"
                    onClick={(e) => handleViewDetails(library, e)}
                  >
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer 
        onHome={handleGoHome}
        onAboutUs={handleShowAboutUs}
        onTerms={handleShowTerms}
        onPrivacy={handleShowPrivacy}
      />
      {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
      {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
      {showAccountManagement && (
        <AccountManagement
          user={currentUser}
          onClose={() => setShowAccountManagement(false)}
          onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}

      {/* Library Details Modal */}
      {selectedLibraryForDetails && (
        <LibraryDetails
          library={selectedLibraryForDetails}
          onClose={handleCloseDetails}
        />
      )}

      {/* Comparison View Modal */}
      {showComparisonView && selectedLibraries.length >= 2 && (
        <ComparisonView
          libraries={selectedLibraries}
          onClose={handleCloseComparisonView}
          onRemoveLibrary={handleRemoveLibrary}
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