'use client'

/**
 * Layout do Dashboard
 * Protege todas as rotas do dashboard
 */

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('📐 DashboardLayout - Renderizando...')
  return <ProtectedRoute>{children}</ProtectedRoute>
}
