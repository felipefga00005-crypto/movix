"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  IconSearch,
  IconBarcode,
  IconPlus,
  IconPackage,
} from "@tabler/icons-react"

interface Produto {
  id: number
  nome: string
  codigo: string
  preco: number
  estoque: number
  categoria?: string
  unidade?: string
}

interface BuscaProdutosProps {
  onAdicionarProduto: (produto: Produto) => void
  onBuscarProdutos: (termo: string) => Promise<Produto[]>
  onBuscarPorCodigo: (codigo: string) => Promise<Produto | null>
  className?: string
}

export function BuscaProdutos({
  onAdicionarProduto,
  onBuscarProdutos,
  onBuscarPorCodigo,
  className
}: BuscaProdutosProps) {
  const [busca, setBusca] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(false)

  // Produtos simulados para demonstração
  const produtosSimulados: Produto[] = [
    {
      id: 1,
      nome: "Coca-Cola 350ml",
      codigo: "001",
      preco: 4.50,
      estoque: 100,
      categoria: "Bebidas",
      unidade: "UN",
    },
    {
      id: 2,
      nome: "Pão de Açúcar 500g",
      codigo: "002",
      preco: 8.90,
      estoque: 50,
      categoria: "Padaria",
      unidade: "UN",
    },
    {
      id: 3,
      nome: "Leite Integral 1L",
      codigo: "003",
      preco: 5.75,
      estoque: 75,
      categoria: "Laticínios",
      unidade: "UN",
    },
    {
      id: 4,
      nome: "Arroz Branco 5kg",
      codigo: "004",
      preco: 22.90,
      estoque: 30,
      categoria: "Grãos",
      unidade: "UN",
    },
    {
      id: 5,
      nome: "Feijão Preto 1kg",
      codigo: "005",
      preco: 7.50,
      estoque: 40,
      categoria: "Grãos",
      unidade: "UN",
    },
  ]

  useEffect(() => {
    if (busca.length >= 2) {
      buscarProdutos(busca)
    } else {
      setProdutos([])
    }
  }, [busca])

  const buscarProdutos = async (termo: string) => {
    setCarregando(true)

    try {
      const produtosEncontrados = await onBuscarProdutos(termo)
      setProdutos(produtosEncontrados)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      // Fallback para produtos simulados
      const produtosFiltrados = produtosSimulados.filter(produto =>
        produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
        produto.codigo.includes(termo) ||
        produto.categoria?.toLowerCase().includes(termo.toLowerCase())
      )
      setProdutos(produtosFiltrados)
    } finally {
      setCarregando(false)
    }
  }

  const buscarPorCodigo = async () => {
    if (!busca) return

    setCarregando(true)

    try {
      const produto = await onBuscarPorCodigo(busca)
      if (produto) {
        onAdicionarProduto(produto)
        setBusca("")
        setProdutos([])
      }
    } catch (error) {
      console.error("Erro ao buscar por código:", error)
      // Fallback para busca local
      const produto = produtosSimulados.find(p => p.codigo === busca)
      if (produto) {
        onAdicionarProduto(produto)
        setBusca("")
        setProdutos([])
      }
    } finally {
      setCarregando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && produtos.length === 1) {
      onAdicionarProduto(produtos[0])
      setBusca("")
      setProdutos([])
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSearch className="h-5 w-5" />
          Buscar Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o nome, código ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={carregando}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={buscarPorCodigo}
            disabled={!busca || carregando}
            title="Buscar por código de barras"
          >
            <IconBarcode className="h-4 w-4" />
          </Button>
        </div>

        {carregando && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {produtos.length > 0 && !carregando && (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    onAdicionarProduto(produto)
                    setBusca("")
                    setProdutos([])
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IconPackage className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{produto.nome}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        Código: {produto.codigo}
                      </p>
                      {produto.categoria && (
                        <Badge variant="secondary" className="text-xs">
                          {produto.categoria}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        Estoque: {produto.estoque} {produto.unidade}
                      </p>
                      <Badge
                        variant={produto.estoque > 10 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {produto.estoque > 10 ? "Disponível" : "Estoque Baixo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      R$ {produto.preco.toFixed(2)}
                    </p>
                    <Button size="sm" variant="outline" className="mt-1">
                      <IconPlus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {busca.length >= 2 && produtos.length === 0 && !carregando && (
          <div className="text-center py-8 text-muted-foreground">
            <IconPackage className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum produto encontrado</p>
            <p className="text-sm">Tente buscar por outro termo</p>
          </div>
        )}

        {busca.length < 2 && (
          <div className="text-center py-8 text-muted-foreground">
            <IconSearch className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Digite pelo menos 2 caracteres para buscar</p>
            <p className="text-sm">Ou use o leitor de código de barras</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
