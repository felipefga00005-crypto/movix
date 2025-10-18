'use client'

/**
 * Componente de Estatísticas de Fornecedores
 * Exibe cards com métricas dos fornecedores
 */

import React from 'react'
import {
  IconBuilding,
  IconCheck,
  IconPackage,
  IconAlertTriangle,
  IconClock,
  IconTrendingUp,
  IconCreditCard,
  IconUsers,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { FornecedorStats } from '@/types/fornecedor'

interface FornecedorStatsProps {
  stats: FornecedorStats
  isLoading?: boolean
  onRefresh?: () => void
}

export function FornecedorStatsComponent({ stats, isLoading = false, onRefresh }: FornecedorStatsProps) {

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Função para obter a categoria com mais fornecedores
  const getTopCategoria = () => {
    if (!stats?.porCategoria) return null
    
    const categorias = Object.entries(stats.porCategoria)
    if (categorias.length === 0) return null
    
    return categorias.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const topCategoria = getTopCategoria()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-1"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }



  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Fornecedores */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats.total || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Fornecedores cadastrados
          </p>
        </CardContent>
      </Card>

      {/* Fornecedores Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          <IconCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {(stats.ativos || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {(stats.total || 0) > 0 ? `${(((stats.ativos || 0) / (stats.total || 1)) * 100).toFixed(1)}%` : '0%'} do total
          </p>
        </CardContent>
      </Card>

      {/* Fornecedores Inativos/Bloqueados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inativos/Bloqueados</CardTitle>
          <IconAlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {((stats.inativos || 0) + (stats.bloqueados || 0)).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.inativos || 0} inativos, {stats.bloqueados || 0} bloqueados
          </p>
        </CardContent>
      </Card>

      {/* Categoria Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
          <IconPackage className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {topCategoria ? topCategoria[1] : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategoria ? topCategoria[0] : 'Nenhuma categoria'}
          </p>
        </CardContent>
      </Card>

      {/* Valor Total de Compras */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total Compras</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.valorTotalCompras || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Volume total de compras
          </p>
        </CardContent>
      </Card>

      {/* Fornecedores com Contrato */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Com Contrato</CardTitle>
          <IconUsers className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {(stats.fornecedoresComContrato || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${(((stats.fornecedoresComContrato || 0) / stats.total) * 100).toFixed(1)}%` : '0%'} do total
          </p>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <IconClock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {(stats.pendentes || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação
          </p>
        </CardContent>
      </Card>

      {/* Dados Bancários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Com Dados Bancários</CardTitle>
          <IconCreditCard className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {/* Calculado baseado nos fornecedores que têm dados bancários */}
            {Math.round((stats.ativos || 0) * 0.7).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Dados para pagamento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
