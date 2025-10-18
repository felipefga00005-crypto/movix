"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconReceipt,
  IconCheck,
  IconPrinter,
  IconFileInvoice,
} from "@tabler/icons-react"
import { ItemVenda } from "./carrinho-compras"
import type { Cliente } from "@/types/cliente"

interface ModalPagamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itens: ItemVenda[]
  cliente: Cliente | null
  total: number
  onFinalizarVenda: (dadosVenda: DadosVenda) => void
}

interface DadosVenda {
  formaPagamento: FormaPagamento
  valorPago: number
  valorTroco: number
  observacoes?: string
  emitirNFCe: boolean
}

interface FormaPagamento {
  codigo: number
  descricao: string
  icon: React.ReactNode
}

const formasPagamento: FormaPagamento[] = [
  {
    codigo: 1,
    descricao: "Dinheiro",
    icon: <IconCash className="h-4 w-4" />,
  },
  {
    codigo: 3,
    descricao: "Cartão de Crédito",
    icon: <IconCreditCard className="h-4 w-4" />,
  },
  {
    codigo: 4,
    descricao: "Cartão de Débito",
    icon: <IconCreditCard className="h-4 w-4" />,
  },
  {
    codigo: 17,
    descricao: "PIX",
    icon: <IconQrcode className="h-4 w-4" />,
  },
  {
    codigo: 99,
    descricao: "Outros",
    icon: <IconReceipt className="h-4 w-4" />,
  },
]

export function ModalPagamento({
  open,
  onOpenChange,
  itens,
  cliente,
  total,
  onFinalizarVenda,
}: ModalPagamentoProps) {
  const [formaSelecionada, setFormaSelecionada] = useState<FormaPagamento | null>(null)
  const [valorPago, setValorPago] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [emitirNFCe, setEmitirNFCe] = useState(true)
  const [processando, setProcessando] = useState(false)

  const valorPagoNum = parseFloat(valorPago) || 0
  const valorTroco = Math.max(0, valorPagoNum - total)
  const pagamentoValido = formaSelecionada && valorPagoNum >= total

  const handleFinalizarVenda = async () => {
    if (!pagamentoValido || !formaSelecionada) return

    setProcessando(true)

    const dadosVenda: DadosVenda = {
      formaPagamento: formaSelecionada,
      valorPago: valorPagoNum,
      valorTroco,
      observacoes: observacoes.trim() || undefined,
      emitirNFCe,
    }

    try {
      await onFinalizarVenda(dadosVenda)
      // Reset form
      setFormaSelecionada(null)
      setValorPago("")
      setObservacoes("")
      setEmitirNFCe(true)
    } finally {
      setProcessando(false)
    }
  }

  const handleFormaPagamentoChange = (forma: FormaPagamento) => {
    setFormaSelecionada(forma)
    
    // Para cartão e PIX, assume valor exato
    if (forma.codigo !== 1) {
      setValorPago(total.toFixed(2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Finalizar Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Venda */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Total de itens:</span>
                <Badge variant="secondary">{itens.length}</Badge>
              </div>
              
              {cliente && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{cliente.razao_social}</span>
                </div>
              )}

              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-3">
              {formasPagamento.map((forma) => (
                <Button
                  key={forma.codigo}
                  variant={formaSelecionada?.codigo === forma.codigo ? "default" : "outline"}
                  className="flex items-center gap-2 h-12"
                  onClick={() => handleFormaPagamentoChange(forma)}
                >
                  {forma.icon}
                  {forma.descricao}
                  {formaSelecionada?.codigo === forma.codigo && (
                    <IconCheck className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Valor Pago */}
          {formaSelecionada && (
            <div className="space-y-3">
              <Label htmlFor="valorPago" className="text-base font-semibold">
                Valor Pago
              </Label>
              <Input
                id="valorPago"
                type="number"
                placeholder="0,00"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                min="0"
                step="0.01"
                className="text-lg"
              />
              
              {valorPagoNum > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Valor da venda:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valor pago:</span>
                    <span>R$ {valorPagoNum.toFixed(2)}</span>
                  </div>
                  {valorTroco > 0 && (
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>Troco:</span>
                      <span>R$ {valorTroco.toFixed(2)}</span>
                    </div>
                  )}
                  {valorPagoNum < total && (
                    <div className="text-sm text-destructive">
                      Valor insuficiente
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Opções Fiscais */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Opções Fiscais</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emitirNFCe"
                checked={emitirNFCe}
                onChange={(e) => setEmitirNFCe(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="emitirNFCe" className="flex items-center gap-2">
                <IconFileInvoice className="h-4 w-4" />
                Emitir NFCe
              </Label>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <Label htmlFor="observacoes" className="text-base font-semibold">
              Observações (opcional)
            </Label>
            <Input
              id="observacoes"
              placeholder="Observações sobre a venda..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFinalizarVenda}
            disabled={!pagamentoValido || processando}
            className="min-w-32"
          >
            {processando ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4" />
                Finalizar Venda
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
