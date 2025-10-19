'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'admin' | 'user')[]
  requireCompany?: boolean
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireCompany = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      // Check role permissions
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard')
        return
      }

      // Check company context requirement
      if (requireCompany && user && !user.company_id) {
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requireCompany, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or authorized
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}

