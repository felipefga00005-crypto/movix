"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  IconPlus,
  IconMinus,
  IconTrash,
  IconShoppingCart,
  IconEdit,
} from "@tabler/icons-react"
import { useState } from "react"

export interface ItemVenda {
  id: number
  produtoId: number
  nome: string
  codigo: string
  preco: number
  quantidade: number
  total: number
  unidade?: string
}

interface CarrinhoComprasProps {
  itens: ItemVenda[]
  onAlterarQuantidade: (itemId: number, novaQuantidade: number) => void
  onRemoverItem: (itemId: number) => void
  onLimparCarrinho: () => void
  className?: string
}

export function CarrinhoCompras({
  itens,
  onAlterarQuantidade,
  onRemoverItem,
  onLimparCarrinho,
  className,
}: CarrinhoComprasProps) {
  const [editandoItem, setEditandoItem] = useState<number | null>(null)
  const [novaQuantidade, setNovaQuantidade] = useState("")

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.total, 0)
  }

  const calcularTotalItens = () => {
    return itens.reduce((total, item) => total + item.quantidade, 0)
  }

  const iniciarEdicao = (item: ItemVenda) => {
    setEditandoItem(item.id)
    setNovaQuantidade(item.quantidade.toString())
  }

  const confirmarEdicao = () => {
    if (editandoItem && novaQuantidade) {
      const quantidade = parseFloat(novaQuantidade)
      if (quantidade > 0) {
        onAlterarQuantidade(editandoItem, quantidade)
      }
    }
    setEditandoItem(null)
    setNovaQuantidade("")
  }

  const cancelarEdicao = () => {
    setEditandoItem(null)
    setNovaQuantidade("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      confirmarEdicao()
    } else if (e.key === "Escape") {
      cancelarEdicao()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconShoppingCart className="h-5 w-5" />
            <span>Carrinho</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {itens.length} {itens.length === 1 ? "item" : "itens"}
            </Badge>
            {itens.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimparCarrinho}
                className="text-destructive hover:text-destructive"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <IconShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Carrinho vazio</p>
            <p className="text-sm">Adicione produtos para começar a venda</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {item.codigo}
                        </p>
                        <Separator orientation="vertical" className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          R$ {item.preco.toFixed(2)} {item.unidade && `/${item.unidade}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {editandoItem === item.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={novaQuantidade}
                            onChange={(e) => setNovaQuantidade(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-16 h-8 text-center"
                            min="0.01"
                            step="0.01"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={confirmarEdicao}
                            className="h-8 w-8 p-0"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelarEdicao}
                            className="h-8 w-8 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAlterarQuantidade(item.id, item.quantidade - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <IconMinus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => iniciarEdicao(item)}
                            className="h-8 min-w-12 px-2 font-mono"
                          >
                            {item.quantidade}
                            <IconEdit className="h-3 w-3 ml-1 opacity-50" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAlterarQuantidade(item.id, item.quantidade + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <IconPlus className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-right min-w-20">
                      <p className="font-bold text-sm">
                        R$ {item.total.toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoverItem(item.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <IconTrash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Quantidade total:</span>
                <span className="font-medium">{calcularTotalItens()} itens</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {calcularTotal().toFixed(2)}</span>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Clique na quantidade para editar
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
