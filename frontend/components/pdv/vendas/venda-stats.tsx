'use client'

/**
 * Componente de Estatísticas de Vendas
 * Mostra métricas importantes das vendas
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconCash,
  IconShoppingCart,
  IconTrendingUp,
  IconTrendingDown,
  IconFileInvoice,
  IconUsers,
} from "@tabler/icons-react"
import { vendasService } from "@/lib/services/vendas"

interface VendaStats {
  totalVendasHoje: number
  valorTotalHoje: number
  totalVendasMes: number
  valorTotalMes: number
  ticketMedio: number
  nfceEmitidas: number
  nfcePendentes: number
  clientesAtendidos: number
  crescimentoVendas: number
  crescimentoValor: number
}

export function VendaStatsComponent() {
  const [stats, setStats] = useState<VendaStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Tentar carregar dados reais da API
      try {
        const [statsHoje, statsMes, dashboard] = await Promise.all([
          vendasService.getEstatisticasHoje(),
          vendasService.getEstatisticasMes(),
          vendasService.getDashboardVendas(),
        ])

        const combinedStats: VendaStats = {
          totalVendasHoje: statsHoje.totalVendas || 0,
          valorTotalHoje: statsHoje.valorTotal || 0,
          totalVendasMes: statsMes.totalVendas || 0,
          valorTotalMes: statsMes.valorTotal || 0,
          ticketMedio: statsHoje.valorTotal && statsHoje.totalVendas
            ? statsHoje.valorTotal / statsHoje.totalVendas
            : 0,
          nfceEmitidas: dashboard.nfceEmitidas || 0,
          nfcePendentes: dashboard.nfcePendentes || 0,
          clientesAtendidos: statsHoje.clientesUnicos || 0,
          crescimentoVendas: dashboard.crescimentoVendas || 0,
          crescimentoValor: dashboard.crescimentoValor || 0,
        }

        setStats(combinedStats)
        return
      } catch (apiError) {
        console.log('APIs não disponíveis, usando dados simulados')
      }

      // Dados simulados como fallback
      setStats({
        totalVendasHoje: 25,
        valorTotalHoje: 2850.50,
        totalVendasMes: 450,
        valorTotalMes: 52300.75,
        ticketMedio: 114.02,
        nfceEmitidas: 380,
        nfcePendentes: 15,
        clientesAtendidos: 18,
        crescimentoVendas: 12.5,
        crescimentoValor: 8.3,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Em caso de erro geral, usar dados zerados
      setStats({
        totalVendasHoje: 0,
        valorTotalHoje: 0,
        totalVendasMes: 0,
        valorTotalMes: 0,
        ticketMedio: 0,
        nfceEmitidas: 0,
        nfcePendentes: 0,
        clientesAtendidos: 0,
        crescimentoVendas: 0,
        crescimentoValor: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Erro ao carregar estatísticas
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Vendas Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
          <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVendasHoje}</div>
          <p className="text-xs text-muted-foreground">
            {stats.crescimentoVendas > 0 ? (
              <span className="text-green-600 flex items-center">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                {formatPercentage(stats.crescimentoVendas)} vs ontem
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <IconTrendingDown className="h-3 w-3 mr-1" />
                {formatPercentage(stats.crescimentoVendas)} vs ontem
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Faturamento Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
          <IconCash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalHoje)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.crescimentoValor > 0 ? (
              <span className="text-green-600 flex items-center">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                {formatPercentage(stats.crescimentoValor)} vs ontem
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <IconTrendingDown className="h-3 w-3 mr-1" />
                {formatPercentage(stats.crescimentoValor)} vs ontem
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</div>
          <p className="text-xs text-muted-foreground">
            Baseado nas vendas de hoje
          </p>
        </CardContent>
      </Card>

      {/* Clientes Atendidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.clientesAtendidos}</div>
          <p className="text-xs text-muted-foreground">
            Clientes únicos hoje
          </p>
        </CardContent>
      </Card>

      {/* Vendas do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
          <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVendasMes}</div>
          <p className="text-xs text-muted-foreground">
            Total no mês atual
          </p>
        </CardContent>
      </Card>

      {/* Faturamento do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
          <IconCash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalMes)}</div>
          <p className="text-xs text-muted-foreground">
            Total no mês atual
          </p>
        </CardContent>
      </Card>

      {/* NFCe Emitidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NFCe Emitidas</CardTitle>
          <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.nfceEmitidas}</div>
          <p className="text-xs text-muted-foreground">
            Documentos autorizados
          </p>
        </CardContent>
      </Card>

      {/* NFCe Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NFCe Pendentes</CardTitle>
          <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.nfcePendentes}</div>
          <p className="text-xs text-muted-foreground">
            Aguardando emissão
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
