"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconPackage, IconPackageExport, IconAlertTriangle, IconTrendingUp } from "@tabler/icons-react"
import { Produto, ProdutoStats } from "@/types/produto"
import { produtoUtils } from "@/lib/api/produtos"

interface ProdutoStatsCardsProps {
  produtos: Produto[]
  stats?: ProdutoStats
  isLoading?: boolean
}

export function ProdutoStatsCards({ produtos, stats, isLoading }: ProdutoStatsCardsProps) {
  // Calcular estatísticas localmente se não fornecidas
  const localStats = React.useMemo(() => {
    if (stats) return stats

    const total = produtos.length
    const ativos = produtos.filter(p => p.status === "Ativo").length
    const inativos = produtos.filter(p => p.status === "Inativo").length
    const descontinuados = produtos.filter(p => p.status === "Descontinuado").length
    const estoqueBaixo = produtos.filter(p => produtoUtils.isEstoqueBaixo(p)).length
    
    // Calcular valor total do estoque
    const valorTotalEstoque = produtos.reduce((total, produto) => {
      return total + (produto.estoque * produto.preco)
    }, 0)

    // Contar por categoria
    const porCategoria: Record<string, number> = {}
    produtos.forEach(produto => {
      if (produto.categoria) {
        porCategoria[produto.categoria] = (porCategoria[produto.categoria] || 0) + 1
      }
    })

    return {
      total,
      ativos,
      inativos,
      descontinuados,
      estoqueBaixo,
      valorTotalEstoque,
      porCategoria
    }
  }, [produtos, stats])

  const cards = [
    {
      title: "Total de Produtos",
      value: localStats.total,
      icon: IconPackage,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "produtos cadastrados"
    },
    {
      title: "Produtos Ativos",
      value: localStats.ativos,
      icon: IconPackageExport,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${localStats.total > 0 ? ((localStats.ativos / localStats.total) * 100).toFixed(1) : 0}% do total`
    },
    {
      title: "Estoque Baixo",
      value: localStats.estoqueBaixo,
      icon: IconAlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "produtos com estoque baixo"
    },
    {
      title: "Valor do Estoque",
      value: produtoUtils.formatPrice(localStats.valorTotalEstoque),
      icon: IconTrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "valor total em estoque",
      isPrice: true
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.isPrice ? 'text-lg' : ''}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Card de categorias */}
      {Object.keys(localStats.porCategoria).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Produtos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localStats.porCategoria)
                .sort(([, a], [, b]) => b - a)
                .map(([categoria, quantidade]) => (
                  <Badge key={categoria} variant="secondary" className="text-sm">
                    {categoria}: {quantidade}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Resumo do Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Taxa de Ativação</p>
              <p className="font-semibold text-green-600">
                {localStats.total > 0 ? ((localStats.ativos / localStats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Maior Categoria</p>
              <p className="font-semibold">
                {Object.entries(localStats.porCategoria).length > 0
                  ? Object.entries(localStats.porCategoria).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Alertas de Estoque</p>
              <p className={`font-semibold ${localStats.estoqueBaixo > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {localStats.estoqueBaixo} produtos
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Geral</p>
              <p className="font-semibold">
                {localStats.estoqueBaixo === 0 ? (
                  <span className="text-green-600">Saudável</span>
                ) : localStats.estoqueBaixo < localStats.total * 0.1 ? (
                  <span className="text-yellow-600">Atenção</span>
                ) : (
                  <span className="text-red-600">Crítico</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de estoque baixo */}
      {localStats.estoqueBaixo > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 text-sm">
              {localStats.estoqueBaixo} produto{localStats.estoqueBaixo > 1 ? 's' : ''} com estoque baixo ou zerado. 
              Verifique a necessidade de reposição.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
