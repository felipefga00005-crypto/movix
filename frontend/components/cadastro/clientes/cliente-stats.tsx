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
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
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

interface ClienteStatsProps {
  onRefresh?: () => void
}

export function ClienteStatsComponent({ onRefresh }: ClienteStatsProps) {
  const [stats, setStats] = useState<ClienteStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

      // Se for erro de autenticação, redireciona para login
      if (error.status === 401) {
        console.warn('Token expirado ou inválido, redirecionando para login...')
        // TODO: Implementar logout automático
        // window.location.href = '/auth/login'
      }
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

  const percentualAtivos = stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0
  const percentualPF = stats.total > 0 ? (stats.pessoaFisica / stats.total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total de Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total de Clientes</CardDescription>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Todos os clientes cadastrados
          </p>
        </CardContent>
      </Card>

      {/* Clientes Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Ativos</CardDescription>
          <IconUserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.ativos.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            <IconTrendingUp className="h-3 w-3 mr-1" />
            {percentualAtivos.toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      {/* Clientes Inativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Inativos</CardDescription>
          <IconUserX className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {stats.inativos.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            <IconTrendingDown className="h-3 w-3 mr-1" />
            {(100 - percentualAtivos).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      {/* Pessoa Física */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Pessoa Física</CardDescription>
          <IconUser className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.pessoaFisica.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {percentualPF.toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      {/* Pessoa Jurídica */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Pessoa Jurídica</CardDescription>
          <IconBuilding className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.pessoaJuridica.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {(100 - percentualPF).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
