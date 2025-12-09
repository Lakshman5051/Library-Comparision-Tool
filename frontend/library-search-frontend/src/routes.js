/**
 * Application Routes Configuration
 *
 * Defines all the routes in the application with their paths and authentication requirements
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Protected routes (require authentication)
  DASHBOARD: '/dashboard',
  LIBRARY_SEARCH: '/search',
  LIBRARY_DETAILS: '/library/:id',
  COMPARISON: '/comparison',
  PROJECT_WORKSPACE: '/projects',
  FAVORITES: '/favorites',
  ACCOUNT: '/account',
};

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (path) => {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.LIBRARY_SEARCH,
    ROUTES.LIBRARY_DETAILS,
    ROUTES.COMPARISON,
    ROUTES.PROJECT_WORKSPACE,
    ROUTES.FAVORITES,
    ROUTES.ACCOUNT,
  ];

  return protectedRoutes.some(route => path.startsWith(route.split(':')[0]));
};