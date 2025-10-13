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
  IconMoreHorizontal, 
  IconSearch,
  IconFilter,
  IconBuilding,
  IconMail,
  IconPhone
} from "@tabler/icons-react"

import { Fornecedor, FornecedorStatus, FornecedorCategoria } from "@/types/fornecedor"
import { fornecedorUtils } from "@/lib/api/fornecedores"

interface FornecedorTableProps {
  fornecedores: Fornecedor[]
  isLoading?: boolean
  onEdit: (fornecedor: Fornecedor) => void
  onDelete: (fornecedor: Fornecedor) => void
}

export function FornecedorTable({ fornecedores, isLoading, onEdit, onDelete }: FornecedorTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoriaFilter, setCategoriaFilter] = React.useState<string>("all")

  // Filtrar fornecedores
  const filteredFornecedores = React.useMemo(() => {
    return fornecedores.filter(fornecedor => {
      const matchesSearch = searchTerm === "" || 
        fornecedor.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.cnpj.includes(searchTerm) ||
        fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || fornecedor.status === statusFilter
      const matchesCategoria = categoriaFilter === "all" || fornecedor.categoria === categoriaFilter

      return matchesSearch && matchesStatus && matchesCategoria
    })
  }, [fornecedores, searchTerm, statusFilter, categoriaFilter])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Skeleton para filtros */}
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
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
          <IconBuilding className="h-5 w-5" />
          Fornecedores ({filteredFornecedores.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por razão social, CNPJ, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value={FornecedorStatus.ATIVO}>Ativo</SelectItem>
                <SelectItem value={FornecedorStatus.INATIVO}>Inativo</SelectItem>
                <SelectItem value={FornecedorStatus.PENDENTE}>Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value={FornecedorCategoria.DISTRIBUIDOR}>Distribuidor</SelectItem>
                <SelectItem value={FornecedorCategoria.FABRICANTE}>Fabricante</SelectItem>
                <SelectItem value={FornecedorCategoria.IMPORTADOR}>Importador</SelectItem>
                <SelectItem value={FornecedorCategoria.PRESTADOR_SERVICO}>Prestador de Serviço</SelectItem>
                <SelectItem value={FornecedorCategoria.OUTROS}>Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFornecedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || categoriaFilter !== "all" 
                        ? "Nenhum fornecedor encontrado com os filtros aplicados."
                        : "Nenhum fornecedor cadastrado ainda."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFornecedores.map((fornecedor) => (
                    <TableRow key={fornecedor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fornecedor.razaoSocial}</div>
                          {fornecedor.nomeFantasia && (
                            <div className="text-sm text-muted-foreground">
                              {fornecedor.nomeFantasia}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {fornecedorUtils.formatCNPJ(fornecedor.cnpj)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {fornecedor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <IconMail className="h-3 w-3 text-gray-400" />
                              {fornecedor.email}
                            </div>
                          )}
                          {fornecedor.telefone && (
                            <div className="flex items-center gap-1 text-sm">
                              <IconPhone className="h-3 w-3 text-gray-400" />
                              {fornecedorUtils.formatTelefone(fornecedor.telefone)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {fornecedor.cidade && fornecedor.uf ? (
                            <span>{fornecedor.cidade}, {fornecedor.uf}</span>
                          ) : (
                            <span className="text-muted-foreground">Não informado</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {fornecedor.categoria ? (
                          <Badge 
                            variant="secondary" 
                            className={fornecedorUtils.getCategoriaColor(fornecedor.categoria)}
                          >
                            {fornecedor.categoria}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não definida</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={fornecedorUtils.getStatusColor(fornecedor.status)}
                        >
                          {fornecedor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <IconMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(fornecedor)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(fornecedor)}
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
          {filteredFornecedores.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredFornecedores.length} de {fornecedores.length} fornecedores
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
