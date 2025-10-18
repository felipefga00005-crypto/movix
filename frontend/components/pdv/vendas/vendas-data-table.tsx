'use client'

/**
 * Data Table para Vendas do PDV
 * Listagem de vendas com filtros e ações
 */

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconX,
  IconFileInvoice,
  IconPrinter,
  IconRefresh,
  IconDots,
} from "@tabler/icons-react"
import type { VendaResponse } from "@/lib/services/vendas"

interface VendasDataTableProps {
  vendas: VendaResponse[]
  loading: boolean
  pagination: any
  filters: any
  onFiltersChange: (filters: any) => void
  onViewDetails: (venda: VendaResponse) => void
  onCancelVenda: (venda: VendaResponse) => void
  onEmitirNFCe: (venda: VendaResponse) => void
  onCancelarNFCe: (venda: VendaResponse) => void
}

export function VendasDataTable({
  vendas,
  loading,
  pagination,
  filters,
  onFiltersChange,
  onViewDetails,
  onCancelVenda,
  onEmitirNFCe,
  onCancelarNFCe,
}: VendasDataTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusFilter = (status: string) => {
    onFiltersChange({ ...filters, status: status === "all" ? "" : status })
  }

  const handleNFCeStatusFilter = (nfceStatus: string) => {
    onFiltersChange({ ...filters, nfceStatus: nfceStatus === "all" ? "" : nfceStatus })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      finalizada: "default",
      pendente: "secondary",
      cancelada: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const getNFCeStatusBadge = (nfceStatus: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      autorizada: "default",
      nao_emitida: "secondary",
      processando: "outline",
      cancelada: "destructive",
      rejeitada: "destructive",
    }
    const labels: Record<string, string> = {
      autorizada: "Autorizada",
      nao_emitida: "Não Emitida",
      processando: "Processando",
      cancelada: "Cancelada",
      rejeitada: "Rejeitada",
    }
    return <Badge variant={variants[nfceStatus] || "outline"}>{labels[nfceStatus] || nfceStatus}</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vendas Realizadas</span>
          <Button variant="outline" size="sm">
            <IconRefresh className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número da venda, cliente..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status da Venda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.nfceStatus || "all"} onValueChange={handleNFCeStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status NFCe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos NFCe</SelectItem>
                <SelectItem value="autorizada">Autorizada</SelectItem>
                <SelectItem value="nao_emitida">Não Emitida</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NFCe</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">{venda.numeroVenda}</TableCell>
                    <TableCell>{formatDate(venda.createdAt)}</TableCell>
                    <TableCell>
                      {venda.cliente ? venda.cliente.nome : "Consumidor Final"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(venda.totalVenda)}
                    </TableCell>
                    <TableCell>{getStatusBadge(venda.status)}</TableCell>
                    <TableCell>{getNFCeStatusBadge(venda.nfceStatus)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewDetails(venda)}>
                            <IconEye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {venda.nfceStatus === "nao_emitida" && (
                            <DropdownMenuItem onClick={() => onEmitirNFCe(venda)}>
                              <IconFileInvoice className="mr-2 h-4 w-4" />
                              Emitir NFCe
                            </DropdownMenuItem>
                          )}
                          {venda.nfceStatus === "autorizada" && (
                            <>
                              <DropdownMenuItem onClick={() => onCancelarNFCe(venda)}>
                                <IconX className="mr-2 h-4 w-4" />
                                Cancelar NFCe
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <IconPrinter className="mr-2 h-4 w-4" />
                                Imprimir DANFE
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {venda.status === "finalizada" && (
                            <DropdownMenuItem 
                              onClick={() => onCancelVenda(venda)}
                              className="text-destructive"
                            >
                              <IconX className="mr-2 h-4 w-4" />
                              Cancelar Venda
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} vendas
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onFiltersChange({ ...filters, page: pagination.page - 1 })}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onFiltersChange({ ...filters, page: pagination.page + 1 })}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
