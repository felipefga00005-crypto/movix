'use client'

/**
 * ProtectedRoute - Componente wrapper para proteger rotas client-side
 * Redireciona para /login se o usuário não estiver autenticado
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  console.log('🛡️ ProtectedRoute - COMPONENTE MONTADO')
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  console.log('🛡️ ProtectedRoute - RENDER - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user)

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)
    if (!isLoading && !isAuthenticated) {
      console.log('❌ ProtectedRoute - Não autenticado, redirecionando para /login')
      router.push('/login')
    } else if (!isLoading && isAuthenticated) {
      console.log('✅ ProtectedRoute - Autenticado, mostrando conteúdo')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    console.log('⏳ ProtectedRoute - Mostrando loading...')
    return (
      fallback || (
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )
    )
  }

  // Se não estiver autenticado, não mostra nada (vai redirecionar)
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Não autenticado, retornando null')
    return null
  }

  // Se estiver autenticado, mostra o conteúdo
  console.log('✅ ProtectedRoute - Renderizando children')
  return <>{children}</>
}

