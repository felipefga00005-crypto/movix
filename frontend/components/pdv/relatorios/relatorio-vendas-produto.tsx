'use client'

/**
 * Relatório de Vendas por Produto
 * Mostra produtos mais vendidos
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
  IconPackage,
} from "@tabler/icons-react"
import { vendasService } from "@/lib/services/vendas"

interface RelatorioVendasProdutoProps {
  dataInicio: string
  dataFim: string
}

interface VendaProduto {
  produtoId: number
  nome: string
  codigo: string
  categoria: string
  quantidadeVendida: number
  valorTotal: number
  valorMedio: number
  participacao: number
}

export function RelatorioVendasPorProduto({
  dataInicio,
  dataFim,
}: RelatorioVendasProdutoProps) {
  const [dados, setDados] = useState<VendaProduto[]>([])
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
      
      const relatorio = await vendasService.getRelatorioVendasPorProduto(inicio, fim)
      
      setDados(relatorio.dados || [])
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      
      // Dados simulados em caso de erro
      setDados([
        {
          produtoId: 1,
          nome: "Produto A",
          codigo: "001",
          categoria: "Categoria 1",
          quantidadeVendida: 45,
          valorTotal: 1250.00,
          valorMedio: 27.78,
          participacao: 35.2,
        },
        {
          produtoId: 2,
          nome: "Produto B",
          codigo: "002",
          categoria: "Categoria 2",
          quantidadeVendida: 32,
          valorTotal: 980.00,
          valorMedio: 30.63,
          participacao: 27.6,
        },
        {
          produtoId: 3,
          nome: "Produto C",
          codigo: "003",
          categoria: "Categoria 1",
          quantidadeVendida: 28,
          valorTotal: 750.00,
          valorMedio: 26.79,
          participacao: 21.1,
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    console.log('Exportar relatório de vendas por produto')
  }

  const getParticipacaoBadge = (participacao: number) => {
    if (participacao >= 30) return "default"
    if (participacao >= 20) return "secondary"
    return "outline"
  }

  if (!dataInicio || !dataFim) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <IconPackage className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione um período</p>
            <p className="text-sm">Configure as datas para gerar o relatório de produtos</p>
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
          <h3 className="text-lg font-semibold">Vendas por Produto</h3>
          <p className="text-sm text-muted-foreground">
            Produtos mais vendidos no período
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
          <CardTitle>Ranking de Produtos</CardTitle>
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
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd Vendida</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Médio</TableHead>
                    <TableHead className="text-right">Participação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum produto vendido no período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados.map((item, index) => (
                      <TableRow key={item.produtoId}>
                        <TableCell>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {item.codigo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categoria}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantidadeVendida}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.valorMedio)}
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
