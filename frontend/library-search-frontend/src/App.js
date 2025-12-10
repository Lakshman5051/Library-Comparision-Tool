import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ROUTES } from './routes';

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
import AddToProjectModal from './Components/ProjectWorkspace/AddToProjectModal';
import FavoritesView from './Components/FavoritesView/FavoritesView';
import Pagination from './Components/Pagination/Pagination';
import { addFavorite, removeFavorite, checkIfFavorited } from './Services/favoriteService';

// Services
import { logout, getCurrentUser } from './Services/authService';

// Library Card Component with Version Badge Positioning and Favorites
function LibraryCard({
  library,
  onViewDetails,
  onAddExistingProject,
  onAddNewProject,
  onToggleCompare,
  isCompared,
  isLoggedIn  // Add authentication state
}) {
  const titleRowRef = useRef(null);
  const versionInlineRef = useRef(null);
  const [showMetaVersion, setShowMetaVersion] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Check favorite status on mount - ONLY if user is logged in
  // Session readiness is now handled in Login component via waitForSessionReady()
  useEffect(() => {
    // CRITICAL: Only check favorites if user is authenticated
    // This prevents calling authenticated endpoints before login completes
    if (library.id && isLoggedIn) {
      const checkFavorite = async () => {
        try {
          const data = await checkIfFavorited(library.id);
          if (data.success) {
            setIsFavorited(data.isFavorited);
          }
        } catch (err) {
          // Silently fail if not authenticated - user might not be logged in yet
          if (err.message && !err.message.includes('Unauthorized')) {
            console.error('Error checking favorite status:', err);
          }
        }
      };

      // Call immediately - no delay needed since Login component waits for session
      checkFavorite();
    } else if (!isLoggedIn) {
      // Reset favorite status if user logs out
      setIsFavorited(null);
    }
  }, [library.id, isLoggedIn]); // Add isLoggedIn as dependency

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

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    setFavoriteLoading(true);

    try {
      if (isFavorited) {
        const data = await removeFavorite(library.id);
        if (data.success) {
          setIsFavorited(false);
        }
      } else {
        const data = await addFavorite(library.id);
        if (data.success) {
          setIsFavorited(true);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

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
      
      {/* Actions row */}
      <div className="library-card-actions-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
        <button
          className="view-details-link"
          onClick={(e) => onViewDetails(library, e)}
        >
          View Details
        </button>
        <div className="add-to-project-inline" style={{ position: 'relative' }}>
          <button
            className="view-details-link"
            onClick={() => setDropdownOpen((open) => !open)}
            title="Add this library to a project"
          >
            Add to Project
          </button>
          {dropdownOpen && (
            <div
              className="add-to-project-menu add-to-project-menu--inline"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                minWidth: '220px',
                zIndex: 10,
                overflow: 'hidden'
              }}
            >
              <button
                className="add-to-project-menu-item"
                style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
                onClick={() => { setDropdownOpen(false); onAddExistingProject(library); }}
              >
                Add to Existing Project
              </button>
              <button
                className="add-to-project-menu-item"
                style={{ width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
                onClick={() => { setDropdownOpen(false); onAddNewProject(library); }}
              >
                Add to New Project
              </button>
            </div>
          )}
        </div>
        <button
          className="view-details-link"
          onClick={() => onToggleCompare(library)}
        >
          {isCompared ? 'Remove from Compare' : 'Add to Compare'}
        </button>
        <button
          className="view-details-link"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: favoriteLoading ? 0.6 : 1,
            cursor: favoriteLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {favoriteLoading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isFavorited ? '#e74c3c' : 'none'}
                stroke={isFavorited ? '#e74c3c' : 'currentColor'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function App() {

  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = process.env.REACT_APP_API_URL || '';

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
  const [showFavoritesView, setShowFavoritesView] = useState(false);
  
  // Core Data State
  const [libraries, setLibraries] = useState([]);
  const [allLibraries, setAllLibraries] = useState([]); // All libraries for filter options
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [comparisonCategory, setComparisonCategory] = useState('');
  const [compareSelection, setCompareSelection] = useState([]);

  // Detail View State
  const [selectedLibraryForDetails, setSelectedLibraryForDetails] = useState(null);
  const [libraryForProjectModal, setLibraryForProjectModal] = useState(null);
  const [showAddToProjectModal, setShowAddToProjectModal] = useState(false);
  const [pendingLibraryForNewProject, setPendingLibraryForNewProject] = useState(null);
  const [workspaceInitialView, setWorkspaceInitialView] = useState('list'); // 'list' | 'create'
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode (using API search)
  const [isFilterMode, setIsFilterMode] = useState(false); // Track if we're filtering by category/platform (using API)
  const [isSortMode, setIsSortMode] = useState(false); // Track if we're sorting (using API sort)
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [usePagination, setUsePagination] = useState(true); // Enable pagination by default

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

  // Simple view state persistence (dashboard | search | workspace | favorites)
  const setView = (viewName) => {
    setShowLandingPage(false);
    setShowDashboard(viewName === 'dashboard');
    setShowLibrarySearch(viewName === 'search');
    setShowProjectWorkspace(viewName === 'workspace');
    setShowFavoritesView(viewName === 'favorites');
    localStorage.setItem('lastView', viewName);

    // Update URL based on view
    const routeMap = {
      'dashboard': ROUTES.DASHBOARD,
      'search': ROUTES.LIBRARY_SEARCH,
      'workspace': ROUTES.PROJECT_WORKSPACE,
      'favorites': ROUTES.FAVORITES,
    };

    if (routeMap[viewName]) {
      navigate(routeMap[viewName]);
    }
  };

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

  // Check if user is already authenticated on app load (session restoration)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || '';
        const response = await fetch(`${API_URL}/api/auth/check`, {
          method: 'GET',
          credentials: 'include', // Include session cookie
        });

        const data = await response.json();

          if (response.ok && data.authenticated) {
          // User is authenticated - fetch user details
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success) {
              // Restore user session
              setCurrentUser(userData);
              setIsLoggedIn(true);
              setShowLandingPage(false);

              // Restore last view (default dashboard)
              const savedView = localStorage.getItem('lastView') || 'dashboard';
              setView(savedView);
              // If restoring into search, load libraries right away
              if (savedView === 'search') {
                fetchAllLibraries();
                fetchAllLibrariesForFilters();
              }
            }
          }
        } else {
          // Not authenticated - show landing page
          setIsLoggedIn(false);
          setShowLandingPage(true);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        // On error, assume not logged in
        setIsLoggedIn(false);
        setShowLandingPage(true);
      }
    };

    // Run once on app load
    checkAuthStatus();
  }, []); // Empty dependency array - run only once

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

  // Sync state with URL on navigation (browser back/forward)
  useEffect(() => {
    if (!isLoggedIn) return;

    const path = location.pathname;

    // Map URL to view state without triggering navigation
    if (path === ROUTES.DASHBOARD) {
      setShowLandingPage(false);
      setShowDashboard(true);
      setShowLibrarySearch(false);
      setShowProjectWorkspace(false);
      setShowFavoritesView(false);
    } else if (path === ROUTES.LIBRARY_SEARCH) {
      setShowLandingPage(false);
      setShowDashboard(false);
      setShowLibrarySearch(true);
      setShowProjectWorkspace(false);
      setShowFavoritesView(false);
    } else if (path === ROUTES.PROJECT_WORKSPACE) {
      setShowLandingPage(false);
      setShowDashboard(false);
      setShowLibrarySearch(false);
      setShowProjectWorkspace(true);
      setShowFavoritesView(false);
    } else if (path === ROUTES.FAVORITES) {
      setShowLandingPage(false);
      setShowDashboard(false);
      setShowLibrarySearch(false);
      setShowProjectWorkspace(false);
      setShowFavoritesView(true);
    }
  }, [location.pathname, isLoggedIn]);

  // Auth Handlers
  
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);

    // Check if this is a new user (first signup)
    if (userData.isNewUser) {
      // Show onboarding for new users
      setShowOnboarding(true);
      // Don't show dashboard yet - wait for "Let's go" button
      // Navigate to dashboard URL even though onboarding is shown
      navigate(ROUTES.DASHBOARD);
    } else {
      // Existing users - show dashboard directly
      setView('dashboard');
    }
  };

  const handleOnboardingGetStarted = () => {
    // User clicked "Let's go" - hide onboarding and show dashboard
    setShowOnboarding(false);
    setView('dashboard');
  };

  const handleDashboardSearchLibraries = () => {
    // User clicked "Search Libraries" - show library search and fetch data
    // Reset all filters and state to show all libraries
    setSearchQuery('');
    setIsSearchMode(false); // Reset search mode
    setIsFilterMode(false); // Reset filter mode
    setIsSortMode(false); // Reset sort mode
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
    //setCheckboxSelectedLibraries([]);
    setSelectedLibraries([]);
    setShowComparisonView(false);
    setShowAdvancedSearch(false);
    
    setView('search');
    fetchAllLibraries();
    // Fetch all libraries for filter options (categories and platforms)
    fetchAllLibrariesForFilters();
  };

  const handleDashboardCreateProject = () => {
    setWorkspaceInitialView('list');
    setView('workspace');
  };

  const handleShowProjects = () => {
    setShowLandingPage(false);
    setWorkspaceInitialView('list');
    // Guarantee pendingLibraryForNewProject is cleared before showing workspace
    setPendingLibraryForNewProject(null);
    setTimeout(() => {
      setShowProjectWorkspace(false);
      setTimeout(() => {
        setShowProjectWorkspace(true);
      }, 0);
    }, 0);
  };

  // From library cards
  const handleAddExistingProject = (library) => {
    setLibraryForProjectModal(library);
    setShowAddToProjectModal(true);
  };

  const handleAddNewProjectFromCard = (library) => {
    if (library) {
      setPendingLibraryForNewProject(library);
    }
    setShowAddToProjectModal(false);
    setLibraryForProjectModal(null);
    setWorkspaceInitialView('create');
    setView('workspace');
  };

  const handleCloseAddToProjectModal = () => {
    setShowAddToProjectModal(false);
    setLibraryForProjectModal(null);
  };

  const handleAddToProjectSuccess = () => {
    if (libraryForProjectModal?.name) {
      alert(`Added "${libraryForProjectModal.name}" to the project.`);
    }
    handleCloseAddToProjectModal();
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  const handleDashboardViewFavorites = () => {
    setView('favorites');
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
      setShowProjectWorkspace(false);
      setShowFavoritesView(false);
      setShowOnboarding(false);
      setShowAccountManagement(false);
      handleResetFilters();
      // Redirect to landing page
      setShowLandingPage(true);
      localStorage.removeItem('lastView');
      // Navigate to home route
      navigate(ROUTES.HOME);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenSignup = () => setShowSignup(true);
  const handleCloseSignup = () => setShowSignup(false);

  // Fetching Layer
  
  // Fetch all libraries without pagination for filter options
  const fetchAllLibrariesForFilters = async () => {
    try {
      const url = new URL(`${API_URL}/api/libraries`);
      url.searchParams.append('paginate', false);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Store all libraries for filter options
      const allLibs = Array.isArray(data) ? data : (data.libraries || []);
      setAllLibraries(allLibs);
      console.log(`Loaded ${allLibs.length} libraries for filter options`);
    } catch (err) {
      console.error('Error fetching all libraries for filters:', err);
      // Don't set error state here - this is a background fetch
    }
  };
  
  const fetchAllLibraries = async (page = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with pagination parameters
      const url = new URL(`${API_URL}/api/libraries`);
      url.searchParams.append('paginate', usePagination);
      if (usePagination) {
        url.searchParams.append('page', page);
        url.searchParams.append('size', 20);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle paginated response
      if (usePagination && data.libraries) {
        setLibraries(data.libraries);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } else {
        // Handle non-paginated response (backward compatibility)
        setLibraries(data);
        setTotalItems(data.length);
      }
    } catch (err) {
      setError('Failed to fetch libraries. Please ensure your backend is running.');
      console.error('Error fetching libraries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Only paginate if not in search mode, filter mode, or sort mode
    if (!isSearchMode && !isFilterMode && !isSortMode) {
      fetchAllLibraries(newPage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search libraries by name using API (searches entire database)
  const searchLibrariesByName = async (query) => {
    if (!query || !query.trim()) {
      // Empty query - go back to normal view
      setIsSearchMode(false);
      setCurrentPage(0);
      fetchAllLibraries(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSearchMode(true);

    try {
      const url = new URL(`${API_URL}/api/libraries/search`);
      url.searchParams.append('name', query.trim());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Search results are not paginated - show all results
      setLibraries(Array.isArray(data) ? data : []);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalItems(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setError('Failed to search libraries. Please try again.');
      console.error('Error searching libraries:', err);
      setIsSearchMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter libraries by category and/or platform using API
  const filterLibrariesByCategoryAndPlatform = async (category, platform) => {
    // If both are empty, go back to normal view
    if (!category && !platform) {
      setIsFilterMode(false);
      setCurrentPage(0);
      fetchAllLibraries(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsFilterMode(true);

    try {
      // Use advanced search API to filter by category and/or platform
      const criteria = {
        categories: category ? [category] : null,
        platforms: platform ? [platform] : null,
        searchQuery: null,
        minStars: null,
        maxStars: null,
        minDependents: null,
        maxDependents: null,
        lastCommitAfter: null,
        includeGrades: null,
        excludeDeprecated: false,
        excludeSecurityVulnerabilities: false,
        excludeUnmaintained: false,
        sortBy: sortBy || null
      };

      const response = await fetch(`${API_URL}/api/libraries/advanced-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter results are not paginated - show all results
      setLibraries(Array.isArray(data) ? data : []);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalItems(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setError('Failed to filter libraries. Please try again.');
      console.error('Error filtering libraries:', err);
      setIsFilterMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Search effect: Trigger API search when searchQuery changes (with debouncing)
  useEffect(() => {
    // Only search if we're in the library search view
    if (!showLibrarySearch) return;

    const timeoutId = setTimeout(() => {
      searchLibrariesByName(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showLibrarySearch]);

  // Fetch sorted libraries using API (sorts entire database)
  const fetchSortedLibraries = async (sortOption) => {
    // If no sort option, go back to normal view
    if (!sortOption || !sortOption.trim()) {
      setIsSortMode(false);
      setCurrentPage(0);
      fetchAllLibraries(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSortMode(true);

    try {
      // Use advanced search API to get all libraries sorted
      const criteria = {
        categories: null,
        platforms: null,
        searchQuery: null,
        minStars: null,
        maxStars: null,
        minDependents: null,
        maxDependents: null,
        lastCommitAfter: null,
        includeGrades: null,
        excludeDeprecated: false,
        excludeSecurityVulnerabilities: false,
        excludeUnmaintained: false,
        sortBy: sortOption
      };

      const response = await fetch(`${API_URL}/api/libraries/advanced-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Sorted results are not paginated - show all results
      setLibraries(Array.isArray(data) ? data : []);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalItems(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setError('Failed to sort libraries. Please try again.');
      console.error('Error sorting libraries:', err);
      setIsSortMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter effect: Trigger API filter when categoryFilter or platformFilter changes
  useEffect(() => {
    // Only filter if we're in the library search view, not in search mode, and search query is empty
    if (!showLibrarySearch || isSearchMode || searchQuery.trim()) return;

    // Debounce filter changes
    const timeoutId = setTimeout(() => {
      filterLibrariesByCategoryAndPlatform(categoryFilter, platformFilter);
    }, 300); // 300ms debounce for filters

    return () => clearTimeout(timeoutId);
  }, [categoryFilter, platformFilter, showLibrarySearch, isSearchMode, searchQuery, sortBy]);

  // Sort effect: Trigger API sort when sortBy changes (only when not searching or filtering)
  useEffect(() => {
    // Only sort if we're in the library search view, not in search mode, not in filter mode, and no search query
    if (!showLibrarySearch || isSearchMode || isFilterMode || searchQuery.trim() || categoryFilter || platformFilter) return;

    // Debounce sort changes
    const timeoutId = setTimeout(() => {
      fetchSortedLibraries(sortBy);
    }, 300); // 300ms debounce for sort

    return () => clearTimeout(timeoutId);
  }, [sortBy, showLibrarySearch, isSearchMode, isFilterMode, searchQuery, categoryFilter, platformFilter]);

  
  const formatDependents = (count) => {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  // sorting logic
  
 const filteredLibraries = useMemo(() => {
  let result = [...libraries];

  // Skip client-side search filtering if we're using API search results
  // The API already filtered by searchQuery, so we don't need to filter again
  if (!isSearchMode && searchQuery.trim()) {
    result = result.filter(lib =>
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lib.description && lib.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Skip client-side category/platform filtering if we're using API filter results
  // The API already filtered by categoryFilter and platformFilter, so we don't need to filter again
  if (!isFilterMode) {
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

  // Skip client-side sorting if we're using API sort results
  // The API already sorted the libraries, so we don't need to sort again
  if (!isSortMode && !isSearchMode && !isFilterMode) {
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
  }

  return result;
}, [libraries, searchQuery, isSearchMode, isFilterMode, isSortMode, categoryFilter, platformFilter, sortBy, starRange, dependentsRange, includeGrades, excludeDeprecated, excludeSecurityIssues, excludeUnmaintained, lastCommitMonths]);

    
 // Get all unique categories from comma-separated categories string
 // Use allLibraries (unfiltered) so filter options reflect all available libraries
const uniqueCategories = useMemo(() => {
  const categorySet = new Set();
  
  allLibraries.forEach(lib => {
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
}, [allLibraries]);

const uniquePlatforms = useMemo(() => {
  const platforms = new Set();
  allLibraries.forEach(lib => {
    // Extract platform from packageManager field, handling null/undefined/empty
    const platform = lib.packageManager;
    if (platform && platform.trim() !== '') {
      platforms.add(platform.trim());
    }
  });
  return Array.from(platforms).sort();
}, [allLibraries]);

// Calculate platform counts from all libraries (not filtered)
const platformCounts = useMemo(() => {
  const counts = {};
  allLibraries.forEach(lib => {
    const platform = lib.packageManager;
    if (platform && platform.trim() !== '') {
      counts[platform] = (counts[platform] || 0) + 1;
    }
  });
  return counts;
}, [allLibraries]);

// Calculate category counts from all libraries (not filtered)
const categoryCounts = useMemo(() => {
  const counts = {};
  allLibraries.forEach(lib => {
    if (lib.categories) {
      lib.categories.split(',').forEach(cat => {
        const trimmed = cat.trim();
        if (trimmed) {
          counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      });
    }
  });
  return counts;
}, [allLibraries]);

  const handleRemoveLibrary = (libraryId) => {
    const updatedLibraries = selectedLibraries.filter(lib => lib.id !== libraryId);
    setSelectedLibraries(updatedLibraries);

    // Reset comparison category if no libraries selected
    if (updatedLibraries.length === 0) {
      setComparisonCategory(null);
      setShowComparisonView(false);
    }
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

  const getPrimaryCategory = (lib) => {
    if (!lib || !lib.categories) return '';
    return lib.categories.split(',')[0].trim();
  };

  // Compare handlers (up to 3 libraries, same category, manual open)
  const handleToggleCompareLibrary = (library) => {
    const exists = compareSelection.find((lib) => lib.id === library.id);
    let updated;
    if (exists) {
      updated = compareSelection.filter((lib) => lib.id !== library.id);
      const remainingCategory = updated.length ? getPrimaryCategory(updated[0]) : '';
      setComparisonCategory(remainingCategory);
    } else {
      const libCat = getPrimaryCategory(library);
      if (comparisonCategory && libCat && comparisonCategory !== libCat) {
        alert('Please select libraries from the same category to compare.');
        return;
      }
      if (compareSelection.length >= 3) {
        alert('You can compare up to 3 libraries.');
        return;
      }
      updated = [...compareSelection, library];
      if (!comparisonCategory && libCat) {
        setComparisonCategory(libCat);
      }
    }

    setCompareSelection(updated);
    if (updated.length < 2) {
      setShowComparisonView(false);
    }
  };

  const handleRemoveFromCompare = (libraryId) => {
    const updated = compareSelection.filter((lib) => lib.id !== libraryId);
    setCompareSelection(updated);
    const remainingCategory = updated.length ? getPrimaryCategory(updated[0]) : '';
    setComparisonCategory(remainingCategory);
    if (updated.length < 2) {
      setShowComparisonView(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setIsSearchMode(false); // Exit search mode
    setIsFilterMode(false); // Exit filter mode
    setIsSortMode(false); // Exit sort mode
    setCategoryFilter('');
    setPlatformFilter('');
    setSortBy('');
    fetchAllLibraries(); // Back to showing all
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
  fetchAllLibrariesForFilters(); // Refresh filter options
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
      fetchAllLibrariesForFilters();
    }
  };

  // Handler to go back to dashboard (for logged in users) or landing page (for non-logged in)
  const handleGoHome = () => {
    if (isLoggedIn) {
      // Logged in users go to dashboard
      setShowLandingPage(false);
      setShowLibrarySearch(false);
      setShowProjectWorkspace(false);
      setShowFavoritesView(false);
      setShowDashboard(true);
      navigate(ROUTES.DASHBOARD);
    } else {
      // Non-logged in users go to landing page
      setShowLandingPage(true);
      navigate(ROUTES.HOME);
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
        {selectedLibraryForDetails && (
          <LibraryDetails
            library={selectedLibraryForDetails}
            onClose={handleCloseDetails}
          />
        )}
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
          onViewFavorites={handleDashboardViewFavorites}
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
          onViewFavorites={handleDashboardViewFavorites}
        >
          <UserBadge
            user={currentUser}
            onLogout={handleLogout}
            onAccountSettings={() => setShowAccountManagement(true)}
          />
        </Header>
        <ProjectWorkspace
          key={workspaceInitialView}
          initialView={workspaceInitialView}
          onBack={handleBackToDashboard}
          onNavigateToCatalog={handleDashboardSearchLibraries}
          pendingLibrary={pendingLibraryForNewProject}
          onLibraryAttached={() => setPendingLibraryForNewProject(null)}
        />
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

  // Show Favorites View
  if (showFavoritesView && isLoggedIn && currentUser) {
    return (
      <div className="app">
        <Header
          onHome={handleGoHome}
          isLoggedIn={true}
          currentUser={currentUser}
          onProjects={handleShowProjects}
          onSearchLibraries={handleDashboardSearchLibraries}
          onViewFavorites={handleDashboardViewFavorites}
        >
          <UserBadge
            user={currentUser}
            onLogout={handleLogout}
            onAccountSettings={() => setShowAccountManagement(true)}
          />
        </Header>
        <FavoritesView
          onBack={handleBackToDashboard}
          onViewDetails={handleViewDetails}
        />
        <Footer
          onHome={handleGoHome}
          onAboutUs={handleShowAboutUs}
          onTerms={handleShowTerms}
          onPrivacy={handleShowPrivacy}
        />
        {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
        {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
        {selectedLibraryForDetails && (
          <LibraryDetails
            library={selectedLibraryForDetails}
            onClose={handleCloseDetails}
          />
        )}
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
        onViewFavorites={handleDashboardViewFavorites}
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
                <label className="filter-label">Category</label>
                <select
                  className="filter-select-modern"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories ({uniqueCategories.length})</option>
                  {uniqueCategories.map(cat => {
                    const count = categoryCounts[cat] || 0;
                    return (
                      <option key={cat} value={cat}>{cat} ({count})</option>
                    );
                  })}
                </select>
              </div>

              <div className="filter-control-group">
                <label className="filter-label">Platform</label>
                <select
                  className="filter-select-modern"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">All Platforms ({uniquePlatforms.length})</option>
                  {uniquePlatforms.map(platform => {
                    const count = platformCounts[platform] || 0;
                    return (
                      <option key={platform} value={platform}>{platform} ({count})</option>
                    );
                  })}
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
                  {showAdvancedSearch ? 'Hide Advanced ▲' : 'Show Advanced ▼'}
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
            <>
              <div className="library-grid">
                {filteredLibraries.map(library => (
                  <LibraryCard
                    key={library.id}
                    library={library}
                    onViewDetails={handleViewDetails}
            onAddExistingProject={handleAddExistingProject}
            onAddNewProject={handleAddNewProjectFromCard}
                    onToggleCompare={handleToggleCompareLibrary}
                    isCompared={!!compareSelection.find((lib) => lib.id === library.id)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {usePagination && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>

        {/* Compare queue bar */}
        {compareSelection.length > 0 && (
          <div className="compare-queue">
            <div className="compare-queue-left">
              <span className="compare-queue-title">
                Compare ({compareSelection.length}/3):
              </span>
              <div className="compare-queue-list">
                {compareSelection.map((lib) => (
                  <span key={lib.id} className="compare-chip">
                    <span className="compare-chip-name">{lib.name}</span>
                    <button
                      className="compare-chip-remove"
                      onClick={() => handleRemoveFromCompare(lib.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="compare-queue-actions">
              <button
                className="view-details-link"
                disabled={compareSelection.length < 2}
                onClick={() => {
                  if (compareSelection.length < 2) return;
                  setSelectedLibraries(compareSelection);
                  setShowComparisonView(true);
                }}
              >
                Open Comparison
              </button>
              <button
                className="view-details-link secondary"
                onClick={() => {
                  setCompareSelection([]);
                  setComparisonCategory('');
                  setShowComparisonView(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

      </main>

      {showAddToProjectModal && libraryForProjectModal && (
        <AddToProjectModal
          isOpen={showAddToProjectModal}
          onClose={handleCloseAddToProjectModal}
          library={libraryForProjectModal}
          onSuccess={handleAddToProjectSuccess}
          onCreateProject={() => handleAddNewProjectFromCard(libraryForProjectModal)}
        />
      )}

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