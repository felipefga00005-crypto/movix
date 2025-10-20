"use client"

import { useState, useEffect } from "react"
import { IconBuilding, IconUsers, IconTrendingUp, IconCheck } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface FornecedorStats {
  totalFornecedores: number
  fornecedoresAtivos: number
  fornecedoresPJ: number
  crescimentoMes: number
}

export function FornecedoresSectionCards() {
  const [stats, setStats] = useState<FornecedorStats>({
    totalFornecedores: 0,
    fornecedoresAtivos: 0,
    fornecedoresPJ: 0,
    crescimentoMes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Simular dados por enquanto - depois integrar com API real
      setStats({
        totalFornecedores: 142,
        fornecedoresAtivos: 138,
        fornecedoresPJ: 89,
        crescimentoMes: 8.2,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  if (loading) {
    return (
      <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFornecedores.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">
            Fornecedores cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
          <IconCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fornecedoresAtivos.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage((stats.fornecedoresAtivos / stats.totalFornecedores) * 100)} do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pessoas Jurídicas</CardTitle>
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fornecedoresPJ.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage((stats.fornecedoresPJ / stats.totalFornecedores) * 100)} do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{formatPercentage(stats.crescimentoMes)}</div>
          <p className="text-xs text-muted-foreground">
            Crescimento no mês
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
