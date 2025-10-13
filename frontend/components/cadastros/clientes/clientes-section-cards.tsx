import { IconTrendingUp, IconUsers, IconUserPlus, IconUserX } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ClienteStats } from "@/types"

interface ClientesSectionCardsProps {
  stats: ClienteStats | null
}

export function ClientesSectionCards({ stats }: ClientesSectionCardsProps) {
  const total = stats?.total || 0
  const ativos = stats?.ativos || 0
  const inativos = stats?.inativos || 0

  const percentualAtivos = total > 0 ? ((ativos / total) * 100).toFixed(1) : "0"

  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total de Clientes</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {total.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Clientes Ativos</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {ativos.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Clientes Inativos</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {inativos.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Taxa de Ativação</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {percentualAtivos}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="pt-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconTrendingUp className="h-3 w-3" />
            Clientes ativos
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
