import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware Next.js para proteção de rotas
 * Verifica se o usuário está autenticado antes de acessar rotas protegidas
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pega o token do localStorage (via cookie ou header)
  const token = request.cookies.get('movix_token')?.value

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register', '/setup', '/forgot-password']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Se é rota pública, permite acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Se não tem token e está tentando acessar rota protegida, redireciona para login
  if (!token && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

