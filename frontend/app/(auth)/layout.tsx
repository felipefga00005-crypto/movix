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
    console.log('🔍 AuthLayout - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)

    // Só redireciona se já passou pelo loading inicial
    if (!isLoading && isAuthenticated) {
      console.log('✅ AuthLayout - Usuário autenticado, redirecionando...')
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Sempre mostra o conteúdo - o redirect acontece via useEffect
  // Isso evita flash de conteúdo e problemas de navegação
  return <>{children}</>
}

