"use client"

import * as React from "react"
import { IconTrendingDown, IconTrendingUp, IconUsers, IconUserCheck, IconUserX, IconUserPlus } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Cliente, ClienteStatus } from "@/types/cliente"

interface ClienteStatsCardsProps {
  clientes: Cliente[]
  isLoading?: boolean
}

export function ClienteStatsCards({ clientes, isLoading }: ClienteStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <CardDescription className="h-4 bg-muted rounded w-24"></CardDescription>
              <CardTitle className="h-8 bg-muted rounded w-16"></CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  // Calcular estatísticas dos clientes
  const stats = React.useMemo(() => {
    const total = clientes.length
    const ativos = clientes.filter(c => c.status === ClienteStatus.ATIVO).length
    const inativos = clientes.filter(c => c.status === ClienteStatus.INATIVO).length
    const pendentes = clientes.filter(c => c.status === ClienteStatus.PENDENTE).length
    
    return { total, ativos, inativos, pendentes }
  }, [clientes])

  const ativosPercentage = stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0
  const inativosPercentage = stats.total > 0 ? (stats.inativos / stats.total) * 100 : 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Total de Clientes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers />
              100%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total de clientes cadastrados <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Todos os clientes no sistema
          </div>
        </CardFooter>
      </Card>

      {/* Clientes Ativos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.ativos}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {ativosPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Clientes com status ativo <IconUserCheck className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Clientes que podem realizar transações
          </div>
        </CardFooter>
      </Card>

      {/* Clientes Inativos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Inativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.inativos}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {inativosPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Clientes desativados <IconUserX className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Clientes que não podem realizar transações
          </div>
        </CardFooter>
      </Card>

      {/* Clientes Pendentes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Pendentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendentes}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUserPlus />
              Novos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aguardando aprovação <IconUserPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Clientes recém-cadastrados
          </div>
        </CardFooter>
      </Card>
      
    </div>
  )
}
