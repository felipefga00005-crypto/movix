'use client'

/**
 * Componente de Estatísticas de Clientes
 * Exibe cards com métricas dos clientes
 */

import { useState, useEffect } from 'react'
import {
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconUser,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { clienteService } from '@/lib/services/cliente.service'
import type { ClienteStats } from '@/types/cliente'
import { useAuth } from '@/hooks/useAuth'

interface ClienteStatsProps {
  onRefresh?: () => void
}

export function ClienteStatsComponent({ onRefresh }: ClienteStatsProps) {
  const [stats, setStats] = useState<ClienteStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { logoutOnTokenExpired } = useAuth()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await clienteService.getStats()
      setStats(data)
      onRefresh?.()
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)

      // Se for erro de autenticação, faz logout automático
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      // Em caso de erro, define stats padrão para evitar crash
      setStats({
        total: 0,
        ativos: 0,
        inativos: 0,
        porTipo: {},
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Garantir que todas as propriedades existem com valores padrão
  const safeStats = {
    total: stats.total || 0,
    ativos: stats.ativos || 0,
    inativos: stats.inativos || 0,
    porTipo: stats.porTipo || {},
  }

  // Extrair dados por tipo de contato
  const clienteCount = safeStats.porTipo['Cliente'] || 0

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {/* Total */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{safeStats.total}</p>
          </div>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>

      {/* Ativos */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Ativos</p>
            <p className="text-lg font-bold text-green-600">{safeStats.ativos}</p>
          </div>
          <IconUserCheck className="h-4 w-4 text-green-600" />
        </div>
      </Card>

      {/* Inativos */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Inativos</p>
            <p className="text-lg font-bold text-gray-600">{safeStats.inativos}</p>
          </div>
          <IconUserX className="h-4 w-4 text-gray-600" />
        </div>
      </Card>

      {/* Clientes */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Clientes</p>
            <p className="text-lg font-bold text-blue-600">{clienteCount}</p>
          </div>
          <IconUser className="h-4 w-4 text-blue-600" />
        </div>
      </Card>
    </div>
  )
}
