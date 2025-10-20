"use client"

import { useState, useEffect } from "react"
import { IconTrendingUp, IconPackage, IconPackageExport, IconCurrencyReal } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProdutoStats {
  totalProdutos: number
  produtosAtivos: number
  valorMedioUnitario: number
  crescimentoMes: number
}

export function ProdutosSectionCards() {
  const [stats, setStats] = useState<ProdutoStats>({
    totalProdutos: 0,
    produtosAtivos: 0,
    valorMedioUnitario: 0,
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
        totalProdutos: 856,
        produtosAtivos: 798,
        valorMedioUnitario: 125.50,
        crescimentoMes: 5.2,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Produtos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalProdutos.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage />
              Cadastrados
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Catálogo diversificado <IconPackage className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de produtos cadastrados no sistema
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produtos Ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.produtosAtivos.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconPackageExport />
              {((stats.produtosAtivos / stats.totalProdutos) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Disponíveis para venda <IconPackageExport className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Produtos com status ativo para comercialização
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Valor Médio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.valorMedioUnitario)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-blue-600">
              <IconCurrencyReal />
              Unitário
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Preço médio dos produtos <IconCurrencyReal className="size-4 text-blue-600" />
          </div>
          <div className="text-muted-foreground">
            Valor médio unitário do catálogo
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Crescimento</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPercentage(stats.crescimentoMes)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Mensal
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expansão do catálogo <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Crescimento do número de produtos
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
