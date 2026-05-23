/**
 * Protected routes - require authentication
 * Users without SESSION cookie will be redirected to /login
 */
export const PROTECTED_PATHS = ['/dashboard', '/account'];

/**
 * Public API endpoints - don't require SESSION cookie
 * These endpoints can be accessed without authentication
 */
export const PUBLIC_API_PATHS = [
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/products',
  '/api/categories',
  '/api/brands',
];

/**
 * Check if a route path is protected
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * Check if an API path is public
 */
export function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '?') || pathname.startsWith(p + '/'),
  );
}
