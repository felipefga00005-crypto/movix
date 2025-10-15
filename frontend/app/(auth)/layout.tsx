'use client'

/**
 * Layout de Autenticação
 * Redireciona para /dashboard se o usuário já estiver autenticado
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, mostra o conteúdo
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // Se estiver autenticado, não mostra nada (vai redirecionar)
  return null
}

