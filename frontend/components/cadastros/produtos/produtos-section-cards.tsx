import { IconTrendingUp, IconPackage, IconAlertTriangle, IconCurrencyReal } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProdutoStats } from "@/types"

interface ProdutosSectionCardsProps {
  stats: ProdutoStats | null
}

export function ProdutosSectionCards({ stats }: ProdutosSectionCardsProps) {
  const total = stats?.total || 0
  const ativos = stats?.ativos || 0
  const inativos = stats?.inativos || 0
  const estoqueBaixo = stats?.estoqueBaixo || 0
  const valorTotal = stats?.valorTotalEstoque || 0

  const percentualAtivos = total > 0 ? ((ativos / total) * 100).toFixed(1) : "0"
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valorTotal)
  return (
    <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total de Produtos</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {total.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Produtos Ativos</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {ativos.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Estoque Baixo</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {estoqueBaixo.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Valor Total</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {valorFormatado}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
