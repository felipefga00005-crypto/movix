import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware Next.js - DESABILITADO
 *
 * O middleware não pode acessar localStorage (client-side only)
 * A proteção de rotas é feita via:
 * - ProtectedRoute component (client-side)
 * - AuthLayout (client-side)
 *
 * Este middleware está aqui apenas para referência futura
 * caso queiramos implementar autenticação via cookies HTTP-only
 */

export function middleware(request: NextRequest) {
  // Permite todas as requisições
  // A proteção é feita no client-side
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

