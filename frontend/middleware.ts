import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/dashboard']
const authRoutes = ['/login']
const publicRoutes = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname)

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth route with valid token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect root to login or dashboard based on auth status
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
    '/',
  ],
}

