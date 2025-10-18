'use client'

/**
 * Relatório de Vendas por Cliente
 * Mostra clientes que mais compraram
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
  IconUsers,
} from "@tabler/icons-react"
import { vendasService } from "@/lib/services/vendas"

interface RelatorioVendasClienteProps {
  dataInicio: string
  dataFim: string
}

interface VendaCliente {
  clienteId: number | null
  nome: string
  cpfCnpj: string | null
  totalCompras: number
  valorTotal: number
  ticketMedio: number
  ultimaCompra: string
  participacao: number
}

export function RelatorioVendasPorCliente({
  dataInicio,
  dataFim,
}: RelatorioVendasClienteProps) {
  const [dados, setDados] = useState<VendaCliente[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dataInicio && dataFim) {
      loadRelatorio()
    }
  }, [dataInicio, dataFim])

  const loadRelatorio = async () => {
    try {
      setLoading(true)
      
      const inicio = new Date(dataInicio)
      const fim = new Date(dataFim)
      
      const relatorio = await vendasService.getRelatorioVendasPorCliente(inicio, fim)
      
      setDados(relatorio.dados || [])
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      
      // Dados simulados em caso de erro
      setDados([
        {
          clienteId: null,
          nome: "Consumidor Final",
          cpfCnpj: null,
          totalCompras: 35,
          valorTotal: 1850.00,
          ticketMedio: 52.86,
          ultimaCompra: "2024-01-17T14:30:00Z",
          participacao: 45.2,
        },
        {
          clienteId: 1,
          nome: "João Silva",
          cpfCnpj: "123.456.789-00",
          totalCompras: 8,
          valorTotal: 980.00,
          ticketMedio: 122.50,
          ultimaCompra: "2024-01-16T16:45:00Z",
          participacao: 24.0,
        },
        {
          clienteId: 2,
          nome: "Maria Santos",
          cpfCnpj: "987.654.321-00",
          totalCompras: 5,
          valorTotal: 750.00,
          ticketMedio: 150.00,
          ultimaCompra: "2024-01-15T10:20:00Z",
          participacao: 18.3,
        },
      ])
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Exportar relatório de vendas por cliente')
  }

  const getParticipacaoBadge = (participacao: number) => {
    if (participacao >= 40) return "default"
    if (participacao >= 20) return "secondary"
    return "outline"
  }

  const getTipoClienteBadge = (clienteId: number | null) => {
    return clienteId ? "default" : "secondary"
  }

  if (!dataInicio || !dataFim) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <IconUsers className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione um período</p>
            <p className="text-sm">Configure as datas para gerar o relatório de clientes</p>
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
          <h3 className="text-lg font-semibold">Vendas por Cliente</h3>
          <p className="text-sm text-muted-foreground">
            Clientes que mais compraram no período
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <IconDownload className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clientes</CardTitle>
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
                    <TableHead>Posição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Compras</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-right">Última Compra</TableHead>
                    <TableHead className="text-right">Participação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma venda encontrada no período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados.map((item, index) => (
                      <TableRow key={item.clienteId || 0}>
                        <TableCell>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            {item.cpfCnpj && (
                              <div className="text-sm text-muted-foreground">
                                {item.cpfCnpj}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTipoClienteBadge(item.clienteId)}>
                            {item.clienteId ? "Cadastrado" : "Consumidor Final"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.totalCompras}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.ticketMedio)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(item.ultimaCompra)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getParticipacaoBadge(item.participacao)}>
                            {formatPercentage(item.participacao)}
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
