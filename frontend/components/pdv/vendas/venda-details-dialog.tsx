'use client'

/**
 * Dialog de Detalhes da Venda
 * Mostra informações completas de uma venda
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  IconUser,
  IconCalendar,
  IconCash,
  IconFileInvoice,
  IconPrinter,
  IconDownload,
} from "@tabler/icons-react"
import type { VendaResponse } from "@/lib/services/vendas"

interface VendaDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venda: VendaResponse | null
}

export function VendaDetailsDialog({
  open,
  onOpenChange,
  venda,
}: VendaDetailsDialogProps) {
  if (!venda) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
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

  const getFormaPagamentoLabel = (codigo: number) => {
    const formas: Record<number, string> = {
      1: "Dinheiro",
      3: "Cartão de Crédito",
      4: "Cartão de Débito",
      17: "PIX",
      99: "Outros",
    }
    return formas[codigo] || "Não informado"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileInvoice className="h-5 w-5" />
            Detalhes da Venda #{venda.numeroVenda}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Número:</span>
                  <span className="font-medium">{venda.numeroVenda}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data/Hora:</span>
                  <span className="font-medium">{formatDate(venda.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(venda.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Usuário:</span>
                  <span className="font-medium">{venda.usuario?.nome || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {venda.cliente ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Nome:</span>
                      <span className="font-medium">{venda.cliente.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">CPF/CNPJ:</span>
                      <span className="font-medium">{venda.cliente.cpf || venda.cliente.cnpj || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-medium">{venda.cliente.email || "N/A"}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <IconUser className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Consumidor Final</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações Fiscais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações Fiscais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Status NFCe:</span>
                  <div>{getNFCeStatusBadge(venda.nfceStatus)}</div>
                </div>
                {venda.nfceNumero && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Número NFCe:</span>
                    <div className="font-medium">{venda.nfceNumero}</div>
                  </div>
                )}
                {venda.nfceChave && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Chave de Acesso:</span>
                    <div className="font-mono text-xs break-all">{venda.nfceChave}</div>
                  </div>
                )}
              </div>
              {venda.nfceDataAut && (
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Data Autorização:</span>
                  <div className="font-medium">{formatDate(venda.nfceDataAut.toString())}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Itens da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Desconto</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venda.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.produto?.nome || "Produto"}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {item.produto?.codigo || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valorUnit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valorDesc)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Totais e Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Totais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(venda.totalProdutos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Desconto:</span>
                  <span className="font-medium">{formatCurrency(venda.totalDesconto)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(venda.totalVenda)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Forma:</span>
                  <span className="font-medium">{getFormaPagamentoLabel(venda.formaPagamento)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor Pago:</span>
                  <span className="font-medium">{formatCurrency(venda.valorPago)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Troco:</span>
                  <span className="font-medium">{formatCurrency(venda.valorTroco)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          {venda.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{venda.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2">
            {venda.nfceStatus === "autorizada" && (
              <>
                <Button variant="outline">
                  <IconPrinter className="mr-2 h-4 w-4" />
                  Imprimir DANFE
                </Button>
                <Button variant="outline">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Download XML
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
