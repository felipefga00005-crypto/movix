import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/setup',
  '/forgot-password',
  '/reset-password',
  '/signup',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/setup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or check if it exists in localStorage (client-side)
  const token = request.cookies.get('token')?.value;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === '/'
  );

  // Check if it's an auth route (login, setup)
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Allow API routes, static files, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!token && !isPublicRoute) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

