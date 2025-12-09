import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import ProjectWorkspace from './Components/ProjectWorkspace/ProjectWorkspace';
import AccountManagement from './Components/AccountManagement/AccountManagement';

// Services
import { logout, getCurrentUser } from './Services/authService';

// Library Card Component with Version Badge Positioning
function LibraryCard({ 
  library, 
  checkboxSelectedLibraries,
  favoriteLibraries,
  onCheckboxToggle,
  onToggleFavorite,
  onViewDetails
}) {
  const titleRowRef = useRef(null);
  const versionInlineRef = useRef(null);
  const [showMetaVersion, setShowMetaVersion] = useState(false);

  useEffect(() => {
    const checkWrapping = () => {
      if (titleRowRef.current && versionInlineRef.current && library.latestVersion) {
        const titleRow = titleRowRef.current;
        const versionBadge = versionInlineRef.current;
        const title = titleRow.querySelector('.library-card-title-large');
        
        if (title && versionBadge) {
          // Check if version badge is on a different line than title
          const titleBottom = title.offsetTop + title.offsetHeight;
          const versionTop = versionBadge.offsetTop;
          
          // Check distance from right edge (action buttons are ~3rem = 48px from right)
          const titleRowWidth = titleRow.offsetWidth;
          const versionRight = versionBadge.offsetLeft + versionBadge.offsetWidth;
          const distanceFromRight = titleRowWidth - versionRight;
          const minDistanceNeeded = 60; // ~3.75rem for action buttons + padding
          
          // If version is significantly lower than title OR too close to right edge, use meta version
          if (versionTop > titleBottom + 5 || distanceFromRight < minDistanceNeeded) {
            setShowMetaVersion(true);
          } else {
            setShowMetaVersion(false);
          }
        }
      }
    };

    // Check on mount with a small delay to ensure DOM is rendered
    const timeoutId = setTimeout(() => {
      checkWrapping();
    }, 100);
    
    window.addEventListener('resize', checkWrapping);
    
    // Use ResizeObserver for more accurate detection
    if (titleRowRef.current) {
      const resizeObserver = new ResizeObserver(checkWrapping);
      resizeObserver.observe(titleRowRef.current);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', checkWrapping);
        resizeObserver.disconnect();
      };
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkWrapping);
    };
  }, [library.latestVersion, library.name]);

  return (
    <div className="library-card">
      {/* Header Section */}
      <div className="library-card-header">
        <div className="library-card-title-row" ref={titleRowRef}>
          <h3 className="library-card-title-large">{library.name}</h3>
          {library.latestVersion && (
            <span 
              ref={versionInlineRef}
              className={`library-card-version-badge library-card-version-badge-inline ${showMetaVersion ? 'hidden' : ''}`}
            >
              v{library.latestVersion}
            </span>
          )}
        </div>
        {/* Checkbox and Favorite Icons */}
        <div className="library-card-actions-top">
          <button
            className="library-card-checkbox-btn"
            onClick={(e) => onCheckboxToggle(library, e)}
            title="Select library"
          >
            <input
              type="checkbox"
              checked={checkboxSelectedLibraries.find(lib => lib.id === library.id) !== undefined}
              onChange={() => {}}
              className="library-card-checkbox"
            />
          </button>
          <button
            className="library-card-favorite-btn"
            onClick={(e) => onToggleFavorite(library, e)}
            title={favoriteLibraries.find(lib => lib.id === library.id) ? "Remove from favorites" : "Add to favorites"}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={favoriteLibraries.find(lib => lib.id === library.id) ? "#ef4444" : "none"} 
              stroke={favoriteLibraries.find(lib => lib.id === library.id) ? "#ef4444" : "currentColor"} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div className="library-card-meta-row">
          {library.lastRegistryReleaseDate && (
            <span className="library-card-updated">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Updated on {library.lastRegistryReleaseDate}
            </span>
          )}
          {library.latestVersion && showMetaVersion && (
            <span className="library-card-version-badge library-card-version-badge-meta">v{library.latestVersion}</span>
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
          {library.categories && (
            <div className="library-card-attribute-item">
              <span className="library-card-attribute-label">Categories:</span>
              <span className="library-card-attribute-value">{library.categories}</span>
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
        onClick={(e) => onViewDetails(library, e)}
      >
        View Details
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M7 7h10v10"/>
        </svg>
      </button>
    </div>
  );
}

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
  const [showProjectWorkspace, setShowProjectWorkspace] = useState(false);
  
  // Core Data State
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  const [comparisonCategory, setComparisonCategory] = useState(null); // Track category for comparison
  const [showComparisonView, setShowComparisonView] = useState(false);
  
  // Checkbox Selection State (for Add to Project / Compare actions)
  const [checkboxSelectedLibraries, setCheckboxSelectedLibraries] = useState([]);
  
  // Favorites State
  const [favoriteLibraries, setFavoriteLibraries] = useState([]);

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
  const advancedSearchRef = useRef(null);

  // Close advanced search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (advancedSearchRef.current && !advancedSearchRef.current.contains(event.target)) {
        setShowAdvancedSearch(false);
      }
    };

    if (showAdvancedSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvancedSearch]);

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
    // Reset all filters and state to show all libraries
    setSearchQuery('');
    setCategoryFilter('');
    setPlatformFilter('');
    setSortBy('');
    setSelectedCategories([]);
    setSelectedPlatforms([]);
    setStarRange({ min: '', max: '' });
    setDependentsRange({ min: '', max: '' });
    setLastCommitMonths('');
    setIncludeGrades(['A', 'B', 'C', 'D', 'F']);
    setExcludeDeprecated(false);
    setExcludeSecurityIssues(false);
    setExcludeUnmaintained(false);
    setCheckboxSelectedLibraries([]);
    setSelectedLibraries([]);
    setComparisonCategory(null);
    setShowComparisonView(false);
    setShowAdvancedSearch(false);
    
    setShowDashboard(false);
    // Ensure Project Workspace is hidden when navigating to Library Search
    setShowProjectWorkspace(false);
    setShowLibrarySearch(true);
    fetchAllLibraries();
  };

  const handleDashboardCreateProject = () => {
    setShowDashboard(false);
    setShowProjectWorkspace(true);
  };

  const handleShowProjects = () => {
    setShowLandingPage(false);
    setShowDashboard(false);
    setShowLibrarySearch(false);
    setShowProjectWorkspace(true);
  };

  const handleBackToDashboard = () => {
    setShowProjectWorkspace(false);
    setShowLibrarySearch(false); // Ensure library search is also hidden
    setShowDashboard(true);
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

  // Category filter: Use basic dropdown (categories removed from advanced search to avoid duplication)
  if (categoryFilter) {
    result = result.filter(lib => {
      if (lib.categories && lib.categories.toLowerCase().includes(categoryFilter.toLowerCase())) return true;
      return false;
    });
  }

  // Platform filter: Use basic dropdown (platforms removed from advanced search to avoid duplication)
  if (platformFilter) {
    result = result.filter(lib => lib.packageManager === platformFilter);
  }

  // Advanced filters: Star range
  if (starRange.min) {
    result = result.filter(lib => (lib.githubStars || 0) >= parseInt(starRange.min));
  }
  if (starRange.max) {
    result = result.filter(lib => (lib.githubStars || 0) <= parseInt(starRange.max));
  }

  // Advanced filters: Dependents range
  if (dependentsRange.min) {
    result = result.filter(lib => (lib.dependentProjectsCount || 0) >= parseInt(dependentsRange.min));
  }
  if (dependentsRange.max) {
    result = result.filter(lib => (lib.dependentProjectsCount || 0) <= parseInt(dependentsRange.max));
  }

  // Advanced filters: Quality grades
  if (includeGrades.length > 0 && includeGrades.length < 5) {
    result = result.filter(lib => 
      lib.qualityGrade && includeGrades.includes(lib.qualityGrade)
    );
  }

  // Advanced filters: Exclude deprecated
  if (excludeDeprecated) {
    result = result.filter(lib => !lib.isDeprecated);
  }

  // Advanced filters: Exclude security vulnerabilities
  if (excludeSecurityIssues) {
    result = result.filter(lib => !lib.hasSecurityVulnerabilities);
  }

  // Advanced filters: Exclude unmaintained
  if (excludeUnmaintained) {
    result = result.filter(lib => lib.activelyMaintained !== false);
  }

  // Advanced filters: Last commit date
  if (lastCommitMonths) {
    const cutoffDate = new Date(Date.now() - lastCommitMonths * 30 * 24 * 60 * 60 * 1000);
    result = result.filter(lib => {
      const lastDate = lib.lastRepositoryReleaseDate || lib.lastRegistryReleaseDate;
      if (!lastDate) return false;
      return new Date(lastDate) >= cutoffDate;
    });
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
        return new Date(b.lastRepositoryReleaseDate || b.lastRegistryReleaseDate || 0) - new Date(a.lastRepositoryReleaseDate || a.lastRegistryReleaseDate || 0);
      default:
        return 0;
    }
  });

  return result;
}, [libraries, searchQuery, categoryFilter, platformFilter, sortBy, starRange, dependentsRange, includeGrades, excludeDeprecated, excludeSecurityIssues, excludeUnmaintained, lastCommitMonths]);

    
 // Get all unique categories from comma-separated categories string
const uniqueCategories = useMemo(() => {
  const categorySet = new Set();
  
  libraries.forEach(lib => {
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

  const handleRemoveLibrary = (libraryId) => {
    const updatedLibraries = selectedLibraries.filter(lib => lib.id !== libraryId);
    setSelectedLibraries(updatedLibraries);

    // Reset comparison category if no libraries selected
    if (updatedLibraries.length === 0) {
      setComparisonCategory(null);
      setShowComparisonView(false);
    }
  };

  // Checkbox Selection Handlers
  const handleCheckboxToggle = (library, event) => {
    event.stopPropagation(); // Prevent card click
    const isSelected = checkboxSelectedLibraries.find(lib => lib.id === library.id);
    if (isSelected) {
      setCheckboxSelectedLibraries(checkboxSelectedLibraries.filter(lib => lib.id !== library.id));
    } else {
      setCheckboxSelectedLibraries([...checkboxSelectedLibraries, library]);
    }
  };

  const handleToggleFavorite = async (library, event) => {
    event.stopPropagation(); // Prevent card click
    const isFavorite = favoriteLibraries.find(lib => lib.id === library.id);
    
    try {
      // TODO: Call API to add/remove favorite
      // For now, just update local state
      if (isFavorite) {
        setFavoriteLibraries(favoriteLibraries.filter(lib => lib.id !== library.id));
      } else {
        setFavoriteLibraries([...favoriteLibraries, library]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToProject = () => {
    if (checkboxSelectedLibraries.length === 0) {
      alert('Please select at least one library');
      return;
    }
    // TODO: Implement add to project functionality
    alert(`Adding ${checkboxSelectedLibraries.length} library/libraries to project...`);
    setCheckboxSelectedLibraries([]);
  };

  const handleCompareSelectedLibraries = () => {
    if (checkboxSelectedLibraries.length < 2) {
      alert('Please select at least 2 libraries to compare');
      return;
    }
    
    // Check if all selected libraries are from the same category
    const categories = checkboxSelectedLibraries.map(lib => {
      return lib.categories ? lib.categories.split(',')[0].trim() : null;
    }).filter(Boolean);
    
    const uniqueCategories = [...new Set(categories)];
    if (uniqueCategories.length > 1) {
      alert('Please select libraries from the same category to compare');
      return;
    }
    
    // Set them as selected libraries and show comparison view
    setSelectedLibraries(checkboxSelectedLibraries);
    setComparisonCategory(uniqueCategories[0] || null);
    setShowComparisonView(true);
    setCheckboxSelectedLibraries([]);
  };

  // Check if checkbox-selected libraries can be compared (2+ from same category)
  const canCompareSelected = useMemo(() => {
    if (checkboxSelectedLibraries.length < 2) return false;
    const categories = checkboxSelectedLibraries.map(lib => {
      return lib.categories ? lib.categories.split(',')[0].trim() : null;
    }).filter(Boolean);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.length === 1;
  }, [checkboxSelectedLibraries]);

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
    // Build search criteria - use basic filters for categories/platforms since they're removed from advanced search
    const criteria = {
      searchQuery: searchQuery || null,
      categories: categoryFilter ? [categoryFilter] : null,
      platforms: platformFilter ? [platformFilter] : null,
      minStars: starRange.min ? parseInt(starRange.min) : null,
      maxStars: starRange.max ? parseInt(starRange.max) : null,
      minDependents: dependentsRange.min ? parseInt(dependentsRange.min) : null,
      maxDependents: dependentsRange.max ? parseInt(dependentsRange.max) : null,
      lastCommitAfter: lastCommitMonths ? 
        new Date(Date.now() - lastCommitMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      includeGrades: includeGrades.length > 0 && includeGrades.length < 5 ? includeGrades : null,
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
  setCategoryFilter(''); // Reset basic category filter
  setPlatformFilter(''); // Reset basic platform filter
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
      setShowProjectWorkspace(false);
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

  // Show Comparison View as full-screen page
  if (showComparisonView && selectedLibraries.length >= 2) {
    return (
      <ComparisonView
        libraries={selectedLibraries}
        onClose={handleCloseComparisonView}
        onRemoveLibrary={handleRemoveLibrary}
      />
    );
  }

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
          onSearchLibraries={handleDashboardSearchLibraries}
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
        <Header 
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
          onProjects={handleShowProjects}
          onSearchLibraries={handleDashboardSearchLibraries}
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

  // Show Project Workspace
  if (showProjectWorkspace && isLoggedIn && currentUser) {
    return (
      <div className="app">
        <Header 
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
          onProjects={handleShowProjects}
          onSearchLibraries={handleDashboardSearchLibraries}
        >
          <UserBadge 
            user={currentUser} 
            onLogout={handleLogout} 
            onAccountSettings={() => setShowAccountManagement(true)} 
          />
        </Header>
        <ProjectWorkspace onBack={handleBackToDashboard} onNavigateToCatalog={handleDashboardSearchLibraries} />
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

  // Show User Dashboard
  if (showDashboard && isLoggedIn && currentUser && !showLibrarySearch) {
    return (
      <div className="app">
        <Header 
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
          onProjects={handleShowProjects}
          onSearchLibraries={handleDashboardSearchLibraries}
          hideNav={true}
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
        onProjects={handleShowProjects}
        onSearchLibraries={handleDashboardSearchLibraries}
      >
        <UserBadge 
          user={currentUser} 
          onLogout={handleLogout} 
          onAccountSettings={() => setShowAccountManagement(true)} 
        />
      </Header>

      {/* Main Content Container */}
      <main className="main-content">
        
        {/* SEARCH AND FILTER BAR */}
        <section className="search-filter-section">
          <div className="search-filter-container">
            {/* Search Input - Left Side */}
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input-modern"
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters - Right Side */}
            <div className="filter-controls-wrapper">
              <div className="filter-control-group">
                <label className="filter-label">Filter: Category</label>
                <select
                  className="filter-select-modern"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories ({libraries.length})</option>
                  {uniqueCategories.map(cat => {
                    const count = libraries.filter(lib => 
                      lib.categories && lib.categories.toLowerCase().includes(cat.toLowerCase())
                    ).length;
                    return (
                      <option key={cat} value={cat}>{cat} ({count})</option>
                    );
                  })}
                </select>
              </div>

              <div className="filter-control-group">
                <label className="filter-label">Filter: Platform</label>
                <select
                  className="filter-select-modern"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">All Platforms</option>
                  {uniquePlatforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div className="filter-control-group">
                <label className="filter-label">Sort:</label>
                <select 
                  className="filter-select-modern"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="stars">Most Stars</option>
                  <option value="dependents">Most Used</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>

              <div className="advanced-toggle-wrapper" ref={advancedSearchRef}>
                <button 
                  className="advanced-toggle-btn-modern" 
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  title="Advanced Search Options"
                >
                  {showAdvancedSearch ? '▲' : '▼'}
                </button>

                {/* Advanced Search Panel (Popup) */}
                {showAdvancedSearch && (
                  <div className="advanced-search-panel-popup">
              
              {/* Note: Categories and Platforms are filtered in the basic filters above */}

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
                <div className="grade-description">
                  <small>Based on overall score: A (≥9.0) = Excellent, B (≥7.0) = Good, C (≥5.0) = Average, D (≥3.0) = Below Average, F (&lt;3.0) = Poor</small>
                </div>
                <div className="checkbox-grid-inline">
                  {['A', 'B', 'C', 'D', 'F'].map(grade => (
                    <label key={grade} className="checkbox-label" title={
                      grade === 'A' ? 'Excellent (Score ≥9.0)' :
                      grade === 'B' ? 'Good (Score ≥7.0)' :
                      grade === 'C' ? 'Average (Score ≥5.0)' :
                      grade === 'D' ? 'Below Average (Score ≥3.0)' :
                      'Poor (Score <3.0)'
                    }>
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
                  Search with Filters
                </button>
                <button className="reset-btn" onClick={handleResetAdvancedFilters}>
                  Clear All Filters
                </button>
              </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      {/* FLOATING ACTION BAR (when libraries selected via checkbox) */}
      {checkboxSelectedLibraries.length > 0 && (
        <div className="checkbox-action-bar">
          <div className="checkbox-action-bar-content">
            <div className="checkbox-action-bar-header">
              <h3>Selected ({checkboxSelectedLibraries.length} {checkboxSelectedLibraries.length === 1 ? 'library' : 'libraries'})</h3>
            </div>
            <div className="checkbox-action-bar-actions">
              <button
                className="action-btn-primary"
                onClick={handleAddToProject}
              >
                Add to Project
              </button>
              {canCompareSelected && (
                <button
                  className="action-btn-secondary"
                  onClick={handleCompareSelectedLibraries}
                >
                  Compare Libraries
                </button>
              )}
              <button
                className="action-btn-clear"
                onClick={() => setCheckboxSelectedLibraries([])}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARY LIST */}
      <section className={`library-list-section ${checkboxSelectedLibraries.length > 0 ? 'has-action-bar' : ''}`}>
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
                <LibraryCard
                  key={library.id}
                  library={library}
                  checkboxSelectedLibraries={checkboxSelectedLibraries}
                  favoriteLibraries={favoriteLibraries}
                  onCheckboxToggle={handleCheckboxToggle}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={handleViewDetails}
                />
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