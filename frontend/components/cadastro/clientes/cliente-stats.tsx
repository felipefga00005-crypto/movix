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
      console.log('Stats recebidas:', data) // Debug
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
        pessoaFisica: 0,
        pessoaJuridica: 0,
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
    pessoaFisica: stats.pessoaFisica || 0,
    pessoaJuridica: stats.pessoaJuridica || 0,
  }

  const percentualAtivos = safeStats.total > 0 ? (safeStats.ativos / safeStats.total) * 100 : 0
  const percentualPF = safeStats.total > 0 ? (safeStats.pessoaFisica / safeStats.total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total de Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total de Clientes</CardDescription>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeStats.total.toLocaleString()}</div>
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
            {safeStats.ativos.toLocaleString()}
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
            {safeStats.inativos.toLocaleString()}
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
            {safeStats.pessoaFisica.toLocaleString()}
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
            {safeStats.pessoaJuridica.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {(100 - percentualPF).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
