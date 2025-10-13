"use client"

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
import { ClienteStats } from "@/types/cliente"

interface ClienteStatsCardsProps {
  stats: ClienteStats | null
  isLoading?: boolean
}

export function ClienteStatsCards({ stats, isLoading }: ClienteStatsCardsProps) {
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

  if (!stats) {
    return null
  }

  const ativosPercentage = stats.total > 0 ? (stats.ativos / stats.total) * 100 : 0
  const inativosPercentage = stats.total > 0 ? (stats.inativos / stats.total) * 100 : 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Total de Clientes */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="size-3" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Base de clientes cadastrados <IconUsers className="size-4" />
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
            {stats.ativos.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconUserCheck className="size-3" />
              {ativosPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
            {ativosPercentage > 70 ? (
              <>Excelente taxa de atividade <IconTrendingUp className="size-4" /></>
            ) : ativosPercentage > 50 ? (
              <>Boa taxa de atividade <IconTrendingUp className="size-4" /></>
            ) : (
              <>Taxa de atividade baixa <IconTrendingDown className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            Clientes com status ativo
          </div>
        </CardFooter>
      </Card>

      {/* Clientes Inativos */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes Inativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.inativos.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600">
              <IconUserX className="size-3" />
              {inativosPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-red-600">
            {inativosPercentage < 20 ? (
              <>Baixa taxa de inatividade <IconTrendingDown className="size-4" /></>
            ) : inativosPercentage < 40 ? (
              <>Taxa moderada de inatividade <IconTrendingUp className="size-4" /></>
            ) : (
              <>Alta taxa de inatividade <IconTrendingUp className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            Clientes com status inativo
          </div>
        </CardFooter>
      </Card>

      {/* Tipo de Contato Predominante */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tipo Predominante</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(() => {
              const tipos = Object.entries(stats.porTipoContato || {})
              if (tipos.length === 0) return "N/A"
              
              const tipoMaior = tipos.reduce((prev, current) => 
                current[1] > prev[1] ? current : prev
              )
              return tipoMaior[0]
            })()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUserPlus className="size-3" />
              {(() => {
                const tipos = Object.entries(stats.porTipoContato || {})
                if (tipos.length === 0 || stats.total === 0) return "0%"
                
                const tipoMaior = tipos.reduce((prev, current) => 
                  current[1] > prev[1] ? current : prev
                )
                return `${((tipoMaior[1] / stats.total) * 100).toFixed(1)}%`
              })()}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Categoria mais comum <IconUserPlus className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Distribuição por tipo de contato
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
