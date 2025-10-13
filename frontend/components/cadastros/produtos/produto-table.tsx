"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import {
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconPackage,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown
} from "@tabler/icons-react"

import { Produto, ProdutoStatus, ProdutoCategoria } from "@/types/produto"
import { produtoUtils } from "@/lib/api/produtos"

interface ProdutoTableProps {
  produtos: Produto[]
  isLoading?: boolean
  onEdit: (produto: Produto) => void
  onDelete: (produto: Produto) => void
  onUpdateEstoque?: (produto: Produto) => void
}

export function ProdutoTable({ produtos, isLoading, onEdit, onDelete, onUpdateEstoque }: ProdutoTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoriaFilter, setCategoriaFilter] = React.useState<string>("all")
  const [estoqueFilter, setEstoqueFilter] = React.useState<string>("all")

  // Filtrar produtos
  const filteredProdutos = React.useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = searchTerm === "" || 
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || produto.status === statusFilter
      const matchesCategoria = categoriaFilter === "all" || produto.categoria === categoriaFilter
      
      let matchesEstoque = true
      if (estoqueFilter === "baixo") {
        matchesEstoque = produtoUtils.isEstoqueBaixo(produto)
      } else if (estoqueFilter === "zerado") {
        matchesEstoque = produto.estoque === 0
      } else if (estoqueFilter === "normal") {
        matchesEstoque = !produtoUtils.isEstoqueBaixo(produto) && produto.estoque > 0
      }

      return matchesSearch && matchesStatus && matchesCategoria && matchesEstoque
    })
  }, [produtos, searchTerm, statusFilter, categoriaFilter, estoqueFilter])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Skeleton para filtros */}
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            
            {/* Skeleton para tabela */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPackage className="h-5 w-5" />
          Produtos ({filteredProdutos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={ProdutoStatus.ATIVO}>Ativo</SelectItem>
                <SelectItem value={ProdutoStatus.INATIVO}>Inativo</SelectItem>
                <SelectItem value={ProdutoStatus.DESCONTINUADO}>Descontinuado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value={ProdutoCategoria.INFORMATICA}>Informática</SelectItem>
                <SelectItem value={ProdutoCategoria.ELETRONICOS}>Eletrônicos</SelectItem>
                <SelectItem value={ProdutoCategoria.CASA_JARDIM}>Casa e Jardim</SelectItem>
                <SelectItem value={ProdutoCategoria.ROUPAS_ACESSORIOS}>Roupas</SelectItem>
                <SelectItem value={ProdutoCategoria.LIVROS}>Livros</SelectItem>
                <SelectItem value={ProdutoCategoria.ESPORTES}>Esportes</SelectItem>
                <SelectItem value={ProdutoCategoria.OUTROS}>Outros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={estoqueFilter} onValueChange={setEstoqueFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="zerado">Zerado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || categoriaFilter !== "all" || estoqueFilter !== "all"
                        ? "Nenhum produto encontrado com os filtros aplicados."
                        : "Nenhum produto cadastrado ainda."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{produto.nome}</div>
                          {produto.marca && (
                            <div className="text-sm text-muted-foreground">
                              {produto.marca}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {produto.codigo}
                        </code>
                      </TableCell>
                      <TableCell>
                        {produto.categoria ? (
                          <Badge 
                            variant="secondary" 
                            className={produtoUtils.getCategoriaColor(produto.categoria)}
                          >
                            {produto.categoria}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não definida</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {produtoUtils.formatPrice(produto.preco)}
                          </div>
                          {produto.precoCusto && produto.precoCusto > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Margem: {produtoUtils.formatMargem(produto)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className={produtoUtils.getEstoqueColor(produto)}
                          >
                            {produto.estoque} {produto.unidade}
                          </Badge>
                          {produtoUtils.isEstoqueBaixo(produto) && (
                            <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Mín: {produto.estoqueMinimo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={produtoUtils.getStatusColor(produto.status)}
                        >
                          {produto.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(produto)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {onUpdateEstoque && (
                              <DropdownMenuItem onClick={() => onUpdateEstoque(produto)}>
                                <IconTrendingUp className="mr-2 h-4 w-4" />
                                Atualizar Estoque
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(produto)}
                              className="text-red-600"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Informações da tabela */}
          {filteredProdutos.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredProdutos.length} de {produtos.length} produtos
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
