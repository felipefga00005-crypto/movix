"use client"

import { useState, useEffect } from "react"
import { IconTrendingDown, IconTrendingUp, IconFileDescription, IconCheck, IconClock } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface NfeStats {
  totalNfes: number
  nfesAutorizadas: number
  nfesDigitacao: number
  valorTotalMes: number
  crescimentoMes: number
}

export function NfeSectionCards() {
  const [stats, setStats] = useState<NfeStats>({
    totalNfes: 0,
    nfesAutorizadas: 0,
    nfesDigitacao: 0,
    valorTotalMes: 0,
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
        totalNfes: 1250,
        nfesAutorizadas: 1180,
        nfesDigitacao: 45,
        valorTotalMes: 2850000,
        crescimentoMes: 12.5,
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
          <CardDescription>Faturamento Mensal</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.valorTotalMes)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.crescimentoMes > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {formatPercentage(stats.crescimentoMes)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.crescimentoMes > 0 ? 'Crescimento' : 'Queda'} em relação ao mês anterior{" "}
            {stats.crescimentoMes > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Valor total das NFes autorizadas
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>NFes Autorizadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.nfesAutorizadas.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconCheck />
              {((stats.nfesAutorizadas / stats.totalNfes) * 100).toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Alta taxa de aprovação <IconCheck className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            NFes transmitidas e autorizadas pela SEFAZ
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Em Digitação</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.nfesDigitacao.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-yellow-600">
              <IconClock />
              Pendente
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aguardando transmissão <IconClock className="size-4 text-yellow-600" />
          </div>
          <div className="text-muted-foreground">
            NFes criadas mas ainda não transmitidas
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de NFes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalNfes.toLocaleString('pt-BR')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFileDescription />
              Este mês
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Volume estável de emissões <IconFileDescription className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de notas fiscais emitidas no período
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
