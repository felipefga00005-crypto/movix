'use client'

/**
 * Relatório de Vendas por Forma de Pagamento
 * Mostra distribuição das formas de pagamento
 */

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  IconDownload,
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconReceipt,
} from "@tabler/icons-react"

interface RelatorioFormaPagamentoProps {
  dataInicio: string
  dataFim: string
}

interface FormaPagamentoData {
  codigo: number
  descricao: string
  totalVendas: number
  valorTotal: number
  participacaoVendas: number
  participacaoValor: number
  ticketMedio: number
}

export function RelatorioFormaPagamento({
  dataInicio,
  dataFim,
}: RelatorioFormaPagamentoProps) {
  const [dados, setDados] = useState<FormaPagamentoData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dataInicio && dataFim) {
      loadRelatorio()
    }
  }, [dataInicio, dataFim])

  const loadRelatorio = async () => {
    try {
      setLoading(true)
      
      // TODO: Implementar chamada para API
      // const relatorio = await vendasService.getRelatorioFormaPagamento(inicio, fim)
      
      // Dados simulados
      setDados([
        {
          codigo: 1,
          descricao: "Dinheiro",
          totalVendas: 25,
          valorTotal: 1250.00,
          participacaoVendas: 41.7,
          participacaoValor: 35.2,
          ticketMedio: 50.00,
        },
        {
          codigo: 17,
          descricao: "PIX",
          totalVendas: 18,
          valorTotal: 1380.00,
          participacaoVendas: 30.0,
          participacaoValor: 38.9,
          ticketMedio: 76.67,
        },
        {
          codigo: 4,
          descricao: "Cartão de Débito",
          totalVendas: 12,
          valorTotal: 650.00,
          participacaoVendas: 20.0,
          participacaoValor: 18.3,
          ticketMedio: 54.17,
        },
        {
          codigo: 3,
          descricao: "Cartão de Crédito",
          totalVendas: 5,
          valorTotal: 270.00,
          participacaoVendas: 8.3,
          participacaoValor: 7.6,
          ticketMedio: 54.00,
        },
      ])
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Exportar relatório de formas de pagamento')
  }

  const getFormaPagamentoIcon = (codigo: number) => {
    switch (codigo) {
      case 1:
        return <IconCash className="h-4 w-4" />
      case 3:
      case 4:
        return <IconCreditCard className="h-4 w-4" />
      case 17:
        return <IconQrcode className="h-4 w-4" />
      default:
        return <IconReceipt className="h-4 w-4" />
    }
  }

  const getParticipacaoBadge = (participacao: number) => {
    if (participacao >= 30) return "default"
    if (participacao >= 15) return "secondary"
    return "outline"
  }

  if (!dataInicio || !dataFim) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <IconCash className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione um período</p>
            <p className="text-sm">Configure as datas para gerar o relatório de formas de pagamento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vendas por Forma de Pagamento</h3>
          <p className="text-sm text-muted-foreground">
            Distribuição das formas de pagamento utilizadas
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <IconDownload className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dados.slice(0, 4).map((item) => (
          <Card key={item.codigo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.descricao}</CardTitle>
              {getFormaPagamentoIcon(item.codigo)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(item.valorTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {item.totalVendas} vendas • {formatPercentage(item.participacaoValor)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-right">% Vendas</TableHead>
                    <TableHead className="text-right">% Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma venda encontrada no período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados.map((item) => (
                      <TableRow key={item.codigo}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormaPagamentoIcon(item.codigo)}
                            <span className="font-medium">{item.descricao}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.totalVendas}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.ticketMedio)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getParticipacaoBadge(item.participacaoVendas)}>
                            {formatPercentage(item.participacaoVendas)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getParticipacaoBadge(item.participacaoValor)}>
                            {formatPercentage(item.participacaoValor)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
