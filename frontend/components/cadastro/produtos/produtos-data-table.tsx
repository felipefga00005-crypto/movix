"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconRefresh,
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconCheck,
  IconX,
  IconFileSpreadsheet,
  IconStar,
  IconTag,
  IconCopy,
  IconTrendingUp,
  IconTrendingDown,
  IconPackage,
  IconCalculator,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DataTableFilter, useDataTableFilters } from '@/components/data-table-filter'
import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters'
import { Package, DollarSign, Tag, Building, ToggleLeft, TrendingUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Produto } from '@/types/produto'

interface ProdutosDataTableProps {
  data: Produto[]
  isLoading?: boolean
  onEdit?: (produto: Produto) => void
  onView?: (produto: Produto) => void
  onDelete?: (produto: Produto) => void
  onNew?: () => void
  onRefresh?: () => void
  onActivate?: (produto: Produto) => void
  onDeactivate?: (produto: Produto) => void
  onSetDestaque?: (produto: Produto, destaque: boolean) => void
  onSetPromocao?: (produto: Produto, promocao: boolean) => void
  onUpdateEstoque?: (produto: Produto) => void
  onUpdatePrecos?: (produto: Produto) => void
  onDuplicar?: (produto: Produto) => void
  onBulkActivate?: (produtos: Produto[]) => void
  onBulkDeactivate?: (produtos: Produto[]) => void
  onBulkDelete?: (produtos: Produto[]) => void
  onBulkUpdatePrecos?: (produtos: Produto[]) => void
  onExportSelected?: (exportData: any[], fileName: string) => void
}

// Função auxiliar para formatar valores monetários
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Função auxiliar para obter cor do status
function getStatusColor(ativo: boolean): "default" | "secondary" {
  return ativo ? 'default' : 'secondary'
}

// Função auxiliar para obter cor da categoria
function getCategoriaColor(categoria: string): "default" | "secondary" | "destructive" | "outline" {
  switch (categoria?.toLowerCase()) {
    case 'eletrônicos':
      return 'default'
    case 'roupas':
      return 'secondary'
    case 'casa':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Função auxiliar para obter status do estoque
function getEstoqueStatus(produto: Produto): { status: string, color: string } {
  if (produto.estoque <= 0) {
    return { status: 'Sem Estoque', color: 'text-red-600' }
  } else if (produto.estoque_minimo && produto.estoque <= produto.estoque_minimo) {
    return { status: 'Baixo Estoque', color: 'text-yellow-600' }
  } else {
    return { status: 'Normal', color: 'text-green-600' }
  }
}

export function ProdutosDataTable({
  data,
  isLoading = false,
  onEdit,
  onView,
  onDelete,
  onNew,
  onRefresh,
  onActivate,
  onDeactivate,
  onSetDestaque,
  onSetPromocao,
  onUpdateEstoque,
  onUpdatePrecos,
  onDuplicar,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onBulkUpdatePrecos,
  onExportSelected,
}: ProdutosDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Estado para o dialog de exportação
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false)
  const [exportFileName, setExportFileName] = React.useState('')

  // Configuração dos filtros avançados
  const dtf = React.useMemo(() => createColumnConfigHelper<Produto>(), [])

  const columnsConfig = React.useMemo(() => [
    dtf.text()
      .id('nome')
      .accessor((produto) => produto.nome)
      .displayName('Nome do Produto')
      .icon(Package)
      .build(),
    dtf.text()
      .id('codigo')
      .accessor((produto) => produto.codigo)
      .displayName('Código')
      .icon(Package)
      .build(),
    dtf.text()
      .id('marca')
      .accessor((produto) => produto.marca || '')
      .displayName('Marca')
      .icon(Tag)
      .build(),
    dtf.text()
      .id('categoria')
      .accessor((produto) => produto.categoria || '')
      .displayName('Categoria')
      .icon(Tag)
      .build(),
    dtf.option()
      .id('ativo')
      .accessor((produto) => produto.ativo ? 'Ativo' : 'Inativo')
      .displayName('Status')
      .icon(ToggleLeft)
      .options([
        { label: 'Ativo', value: 'Ativo' },
        { label: 'Inativo', value: 'Inativo' },
      ])
      .build(),
    dtf.option()
      .id('destaque')
      .accessor((produto) => produto.destaque ? 'Sim' : 'Não')
      .displayName('Destaque')
      .icon(TrendingUp)
      .options([
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ])
      .build(),
    dtf.option()
      .id('promocao')
      .accessor((produto) => produto.promocao ? 'Sim' : 'Não')
      .displayName('Promoção')
      .icon(Tag)
      .options([
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
      ])
      .build(),
  ], [dtf])

  // Hook do DataTableFilter
  const { columns: filterColumns, filters, actions } = useDataTableFilters({
    strategy: 'client',
    data,
    columnsConfig,
  })

  const columns: ColumnDef<Produto>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="mx-auto"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "codigo",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.codigo}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "nome",
      header: "Nome do Produto",
      cell: ({ row }) => (
        <div className="max-w-[250px] min-w-0">
          <div className="font-medium truncate" title={row.original.nome}>
            {row.original.nome}
          </div>
          {row.original.marca && (
            <div className="text-sm text-muted-foreground truncate" title={row.original.marca}>
              {row.original.marca}
            </div>
          )}
        </div>
      ),
      enableHiding: false,
      size: 250,
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => (
        <Badge variant={getCategoriaColor(row.original.categoria || '')} className="text-xs">
          {row.original.categoria || '-'}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "preco",
      header: "Preço",
      cell: ({ row }) => (
        <div className="text-right font-mono">
          <div className="font-medium">
            {formatCurrency(row.original.preco)}
          </div>
          {row.original.preco_promocional && row.original.preco_promocional > 0 && (
            <div className="text-sm text-green-600">
              Promo: {formatCurrency(row.original.preco_promocional)}
            </div>
          )}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "estoque",
      header: "Estoque",
      cell: ({ row }) => {
        const estoqueStatus = getEstoqueStatus(row.original)
        return (
          <div className="text-center">
            <div className={`font-medium ${estoqueStatus.color}`}>
              {row.original.estoque} {row.original.unidade_medida}
            </div>
            <div className="text-xs text-muted-foreground">
              {estoqueStatus.status}
            </div>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "margem",
      header: "Margem",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium">
            {row.original.margem_lucro?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-muted-foreground">
            Custo: {formatCurrency(row.original.preco_custo)}
          </div>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant={getStatusColor(row.original.ativo)}>
            {row.original.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
          <div className="flex gap-1">
            {row.original.destaque && (
              <Badge variant="outline" className="text-xs">
                <IconStar className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
            )}
            {row.original.promocao && (
              <Badge variant="outline" className="text-xs">
                <IconTag className="h-3 w-3 mr-1" />
                Promoção
              </Badge>
            )}
          </div>
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <IconEye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onDuplicar && (
              <DropdownMenuItem onClick={() => onDuplicar(row.original)}>
                <IconCopy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {onUpdateEstoque && (
              <DropdownMenuItem onClick={() => onUpdateEstoque(row.original)}>
                <IconPackage className="mr-2 h-4 w-4" />
                Atualizar Estoque
              </DropdownMenuItem>
            )}

            {onUpdatePrecos && (
              <DropdownMenuItem onClick={() => onUpdatePrecos(row.original)}>
                <IconCalculator className="mr-2 h-4 w-4" />
                Atualizar Preços
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {onActivate && !row.original.ativo && (
              <DropdownMenuItem onClick={() => onActivate(row.original)}>
                <IconCheck className="mr-2 h-4 w-4" />
                Ativar
              </DropdownMenuItem>
            )}

            {onDeactivate && row.original.ativo && (
              <DropdownMenuItem onClick={() => onDeactivate(row.original)}>
                <IconX className="mr-2 h-4 w-4" />
                Inativar
              </DropdownMenuItem>
            )}

            {onSetDestaque && (
              <DropdownMenuItem
                onClick={() => onSetDestaque(row.original, !row.original.destaque)}
              >
                {row.original.destaque ? (
                  <>
                    <IconX className="mr-2 h-4 w-4" />
                    Remover Destaque
                  </>
                ) : (
                  <>
                    <IconStar className="mr-2 h-4 w-4" />
                    Destacar
                  </>
                )}
              </DropdownMenuItem>
            )}

            {onSetPromocao && (
              <DropdownMenuItem
                onClick={() => onSetPromocao(row.original, !row.original.promocao)}
              >
                {row.original.promocao ? (
                  <>
                    <IconX className="mr-2 h-4 w-4" />
                    Remover Promoção
                  </>
                ) : (
                  <>
                    <IconTag className="mr-2 h-4 w-4" />
                    Colocar em Promoção
                  </>
                )}
              </DropdownMenuItem>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
  ], [onEdit, onView, onDelete, onActivate, onDeactivate, onSetDestaque, onSetPromocao, onUpdateEstoque, onUpdatePrecos, onDuplicar])

  // Aplicar filtros avançados aos dados
  const filteredData = React.useMemo(() => {
    if (filters.length === 0) return data

    return data.filter((produto) => {
      return filters.every((filter) => {
        const column = columnsConfig.find(col => col.id === filter.columnId)
        if (!column) return true

        const value = column.accessor(produto)

        switch (filter.type) {
          case 'text':
            if (!filter.values || filter.values.length === 0) return true
            return value?.toString().toLowerCase().includes(filter.values[0].toLowerCase())

          case 'option':
            if (!filter.values || filter.values.length === 0) return true
            return filter.values.includes(value)

          default:
            return true
        }
      })
    })
  }, [data, filters, columnsConfig])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id?.toString() || '',
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedProdutos = selectedRows.map(row => row.original)

  const handleExport = () => {
    if (!onExportSelected) return

    const fileName = exportFileName.trim() || `produtos_${new Date().toISOString().split('T')[0]}`

    // Preparar dados para exportação
    const exportData = selectedProdutos.map(produto => ({
      'Código': produto.codigo,
      'Nome': produto.nome,
      'Marca': produto.marca || '',
      'Categoria': produto.categoria || '',
      'Preço Custo': produto.preco_custo,
      'Preço Venda': produto.preco,
      'Preço Promocional': produto.preco_promocional || '',
      'Margem (%)': produto.margem_lucro || 0,
      'Estoque': produto.estoque,
      'Unidade': produto.unidade_medida,
      'Status': produto.ativo ? 'Ativo' : 'Inativo',
      'Destaque': produto.destaque ? 'Sim' : 'Não',
      'Promoção': produto.promocao ? 'Sim' : 'Não',
      'NCM': produto.ncm || '',
      'Fornecedor': produto.fornecedor_principal || '',
    }))

    onExportSelected(exportData, fileName)
    setIsExportDialogOpen(false)
    setExportFileName('')
  }

  return (
    <div className="space-y-3">
      {/* Barra de Ações em Massa */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedRows.length} {selectedRows.length === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <div className="flex items-center gap-2">
            {/* Dropdown de Status */}
            {(onBulkActivate || onBulkDeactivate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Alterar Status
                    <IconChevronDown className="ml-2 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onBulkActivate && (
                    <DropdownMenuItem onClick={() => onBulkActivate(selectedProdutos)}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Ativar Selecionados
                    </DropdownMenuItem>
                  )}
                  {onBulkDeactivate && (
                    <DropdownMenuItem onClick={() => onBulkDeactivate(selectedProdutos)}>
                      <IconX className="mr-2 h-4 w-4" />
                      Inativar Selecionados
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Atualizar Preços em Massa */}
            {onBulkUpdatePrecos && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkUpdatePrecos(selectedProdutos)}
                className="h-8"
              >
                <IconCalculator className="mr-2 h-4 w-4" />
                Preços
              </Button>
            )}

            {/* Exportar Excel */}
            {onExportSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
                className="h-8"
              >
                <IconFileSpreadsheet className="h-4 w-4" />
              </Button>
            )}

            {/* Excluir */}
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkDelete(selectedProdutos)}
                className="h-8"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}

            {/* Limpar Seleção */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.toggleAllPageRowsSelected(false)}
              className="h-8"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header com filtros e ações */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {/* Filtros avançados */}
          <div className="flex-1 lg:max-w-md">
            <DataTableFilter
              columns={filterColumns}
              filters={filters}
              actions={actions}
              strategy="client"
              locale="en"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 lg:ml-4">
            {onRefresh && (
              <Button variant="outline" className="h-7" onClick={onRefresh} disabled={isLoading}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-7">
                  <IconLayoutColumns className="mr-2 h-4 w-4" />
                  Colunas
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {onNew && (
              <Button className="h-7" onClick={onNew}>
                <IconPlus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela - Versão simplificada para economizar espaço */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            {header.column.getIsSorted() === "asc" ? (
                              <IconArrowUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <IconArrowDown className="h-4 w-4" />
                            ) : (
                              <IconArrowsSort className="h-4 w-4 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Exportação - Simplificado */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar para Excel</DialogTitle>
            <DialogDescription>
              Exportar {selectedRows.length} produto(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">Nome do arquivo</Label>
              <Input
                id="fileName"
                placeholder="Ex: produtos_janeiro_2025"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              <IconFileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
