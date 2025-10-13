"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBuilding, IconBuildingStore, IconClock, IconX } from "@tabler/icons-react"

import { Fornecedor, FornecedorStatus } from "@/types/fornecedor"

interface FornecedorStatsCardsProps {
  fornecedores: Fornecedor[]
}

export function FornecedorStatsCards({ fornecedores }: FornecedorStatsCardsProps) {
  const stats = React.useMemo(() => {
    const total = fornecedores.length
    const ativos = fornecedores.filter(f => f.status === FornecedorStatus.ATIVO).length
    const inativos = fornecedores.filter(f => f.status === FornecedorStatus.INATIVO).length
    const pendentes = fornecedores.filter(f => f.status === FornecedorStatus.PENDENTE).length

    return {
      total,
      ativos,
      inativos,
      pendentes
    }
  }, [fornecedores])

  const cards = [
    {
      title: "Total de Fornecedores",
      value: stats.total,
      icon: IconBuilding,
      description: "Fornecedores cadastrados",
      color: "text-blue-600"
    },
    {
      title: "Fornecedores Ativos",
      value: stats.ativos,
      icon: IconBuildingStore,
      description: "Fornecedores ativos",
      color: "text-green-600"
    },
    {
      title: "Fornecedores Pendentes",
      value: stats.pendentes,
      icon: IconClock,
      description: "Aguardando aprovação",
      color: "text-yellow-600"
    },
    {
      title: "Fornecedores Inativos",
      value: stats.inativos,
      icon: IconX,
      description: "Fornecedores inativos",
      color: "text-red-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
