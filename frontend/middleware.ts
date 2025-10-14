import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticação
 *
 * NOTA: O middleware do Next.js roda no Edge Runtime e não tem acesso ao localStorage.
 * Por isso, a verificação de autenticação real é feita no client-side usando:
 * - AuthContext: Gerencia estado de autenticação
 * - PublicRoute: Protege rotas públicas (redireciona se autenticado)
 * - ProtectedRoute: Protege rotas privadas (redireciona se não autenticado)
 *
 * Este middleware é apenas para casos especiais e logging.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite todas as rotas passarem
  // A proteção real é feita pelos layouts (auth) e (dashboard)
  return NextResponse.next();
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
};

