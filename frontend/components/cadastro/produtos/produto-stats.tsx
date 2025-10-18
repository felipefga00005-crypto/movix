'use client'

/**
 * Componente de Estatísticas de Produtos
 * Exibe cards com métricas dos produtos
 */

import { useState, useEffect } from 'react'
import {
  IconPackage,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconStar,
  IconTag,
  IconCurrencyDollar,
  IconChartBar,
  IconShoppingCart,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { produtoService } from '@/lib/services/produto.service'
import type { ProdutoStats } from '@/types/produto'
import { useAuth } from '@/hooks/useAuth'

interface ProdutoStatsProps {
  onRefresh?: () => void
}

export function ProdutoStatsComponent({ onRefresh }: ProdutoStatsProps) {
  const [stats, setStats] = useState<ProdutoStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { logoutOnTokenExpired } = useAuth()

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await produtoService.getStats()
      setStats(data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Função para obter a categoria com mais produtos
  const getTopCategoria = () => {
    if (!stats?.porCategoria) return null
    
    const categorias = Object.entries(stats.porCategoria)
    if (categorias.length === 0) return null
    
    return categorias.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  // Função para obter a marca com mais produtos
  const getTopMarca = () => {
    if (!stats?.porMarca) return null
    
    const marcas = Object.entries(stats.porMarca)
    if (marcas.length === 0) return null
    
    return marcas.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const topCategoria = getTopCategoria()
  const topMarca = getTopMarca()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
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
      {/* Total de Produtos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <IconPackage className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats.total || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Produtos cadastrados
          </p>
        </CardContent>
      </Card>

      {/* Produtos Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-green-600" />
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

      {/* Produtos Inativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inativos</CardTitle>
          <IconTrendingDown className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {(stats.inativos || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {(stats.total || 0) > 0 ? `${(((stats.inativos || 0) / (stats.total || 1)) * 100).toFixed(1)}%` : '0%'} do total
          </p>
        </CardContent>
      </Card>

      {/* Baixo Estoque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
          <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {(stats.baixoEstoque || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos com estoque baixo
          </p>
        </CardContent>
      </Card>

      {/* Sem Estoque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
          <IconAlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {(stats.semEstoque || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos zerados
          </p>
        </CardContent>
      </Card>

      {/* Em Promoção */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Promoção</CardTitle>
          <IconTag className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {(stats.emPromocao || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos promocionais
          </p>
        </CardContent>
      </Card>

      {/* Em Destaque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Destaque</CardTitle>
          <IconStar className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {(stats.emDestaque || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos destacados
          </p>
        </CardContent>
      </Card>

      {/* Valor Total do Estoque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
          <IconCurrencyDollar className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(stats.valorTotalEstoque || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor total em estoque
          </p>
        </CardContent>
      </Card>

      {/* Preço Médio de Venda */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preço Médio Venda</CardTitle>
          <IconShoppingCart className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.valorMedioVenda || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Preço médio dos produtos
          </p>
        </CardContent>
      </Card>

      {/* Margem de Lucro Média */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          <IconChartBar className="h-4 w-4 text-teal-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-600">
            {(stats.margemLucroMedia || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Margem de lucro média
          </p>
        </CardContent>
      </Card>

      {/* Categoria Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
          <IconPackage className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-600">
            {topCategoria ? topCategoria[1] : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategoria ? topCategoria[0] : 'Nenhuma categoria'}
          </p>
        </CardContent>
      </Card>

      {/* Marca Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marca Principal</CardTitle>
          <IconTag className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-600">
            {topMarca ? topMarca[1] : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {topMarca ? topMarca[0] : 'Nenhuma marca'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
