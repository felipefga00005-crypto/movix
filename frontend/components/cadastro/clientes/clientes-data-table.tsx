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
import { User, CreditCard, Mail, MapPin, ToggleLeft } from 'lucide-react'
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

import type { Cliente } from '@/types/cliente'

interface ClientesDataTableProps {
  data: Cliente[]
  isLoading?: boolean
  onEdit?: (cliente: Cliente) => void
  onView?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onNew?: () => void
  onRefresh?: () => void
  onActivate?: (cliente: Cliente) => void
  onDeactivate?: (cliente: Cliente) => void
  onBulkActivate?: (clientes: Cliente[]) => void
  onBulkDeactivate?: (clientes: Cliente[]) => void
  onBulkDelete?: (clientes: Cliente[]) => void
  onExportSelected?: (exportData: any[], fileName: string) => void
}

// Função auxiliar para formatar CPF/CNPJ
function formatCpfCnpj(value: string): string {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return value
}

// Função auxiliar para obter label do tipo de pessoa
function getTipoPessoaLabel(tipo: string): string {
  return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'
}

// Função auxiliar para obter cor do status
function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case 'ativo':
      return 'default'
    case 'inativo':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function ClientesDataTable({
  data,
  isLoading = false,
  onEdit,
  onView,
  onDelete,
  onNew,
  onRefresh,
  onActivate,
  onDeactivate,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onExportSelected,
}: ClientesDataTableProps) {
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
  const [exportColumns, setExportColumns] = React.useState({
    tipo: true,
    cnpj_cpf: true,
    razao_social: true,
    nome_fantasia: true,
    email: true,
    fone: true,
    celular: true,
    municipio: true,
    uf: true,
    status: true,
    ie: false,
    im: false,
    logradouro: false,
    numero: false,
    bairro: false,
    cep: false,
  })

  // Configuração dos filtros avançados
  const dtf = React.useMemo(() => createColumnConfigHelper<Cliente>(), [])

  const columnsConfig = React.useMemo(() => [
    dtf.text()
      .id('razao_social')
      .accessor((cliente) => cliente.razao_social)
      .displayName('Nome/Razão Social')
      .icon(User)
      .build(),
    dtf.text()
      .id('nome_fantasia')
      .accessor((cliente) => cliente.nome_fantasia || '')
      .displayName('Nome Fantasia')
      .icon(User)
      .build(),
    dtf.text()
      .id('cnpj_cpf')
      .accessor((cliente) => cliente.cnpj_cpf)
      .displayName('CPF/CNPJ')
      .icon(CreditCard)
      .build(),
    dtf.text()
      .id('email')
      .accessor((cliente) => cliente.email || '')
      .displayName('Email')
      .icon(Mail)
      .build(),
    dtf.text()
      .id('telefone')
      .accessor((cliente) => cliente.fone || cliente.celular || '')
      .displayName('Telefone')
      .icon(CreditCard)
      .build(),
    dtf.text()
      .id('municipio')
      .accessor((cliente) => cliente.municipio || '')
      .displayName('Cidade')
      .icon(MapPin)
      .build(),
    dtf.text()
      .id('uf')
      .accessor((cliente) => cliente.uf || '')
      .displayName('UF')
      .icon(MapPin)
      .build(),
    dtf.option()
      .id('status')
      .accessor((cliente) => cliente.status)
      .displayName('Status')
      .icon(ToggleLeft)
      .options([
        { label: 'Ativo', value: 'Ativo' },
        { label: 'Inativo', value: 'Inativo' },
      ])
      .build(),
    dtf.option()
      .id('tipo_pessoa')
      .accessor((cliente) => cliente.tipo_pessoa)
      .displayName('Tipo de Pessoa')
      .icon(User)
      .options([
        { label: 'Pessoa Física', value: 'PF' },
        { label: 'Pessoa Jurídica', value: 'PJ' },
      ])
      .build(),
  ], [dtf])

  // Hook do DataTableFilter
  const { columns: filterColumns, filters, actions } = useDataTableFilters({
    strategy: 'client',
    data,
    columnsConfig,
  })

  const columns: ColumnDef<Cliente>[] = React.useMemo(() => [
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
      accessorKey: "tipo_pessoa",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {getTipoPessoaLabel(row.original.tipo_pessoa)}
        </Badge>
      ),
      size: 80,
    },
    {
      accessorKey: "razao_social",
      header: "Nome/Razão Social",
      cell: ({ row }) => (
        <div className="max-w-[250px] min-w-0">
          <div className="font-medium truncate" title={row.original.razao_social}>
            {row.original.razao_social}
          </div>
          {row.original.nome_fantasia && (
            <div className="text-sm text-muted-foreground truncate" title={row.original.nome_fantasia}>
              {row.original.nome_fantasia}
            </div>
          )}
        </div>
      ),
      enableHiding: false,
      size: 250,
    },
    {
      accessorKey: "cnpj_cpf",
      header: "CPF/CNPJ",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatCpfCnpj(row.original.cnpj_cpf)}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[200px] min-w-0">
          <span
            className="text-muted-foreground truncate block"
            title={row.original.email || '-'}
          >
            {row.original.email || '-'}
          </span>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.fone || row.original.celular || '-'}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: "cidade",
      header: "Cidade/UF",
      cell: ({ row }) => {
        const cidadeUf = row.original.municipio && row.original.uf
          ? `${row.original.municipio}/${row.original.uf}`
          : '-'
        return (
          <div className="max-w-[150px] min-w-0">
            <span className="text-sm truncate block" title={cidadeUf}>
              {cidadeUf}
            </span>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
      size: 80,
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
          <DropdownMenuContent align="end" className="w-40">
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

            {(onActivate || onDeactivate) && <DropdownMenuSeparator />}

            {onActivate && row.original.status === 'Inativo' && (
              <DropdownMenuItem onClick={() => onActivate(row.original)}>
                <IconCheck className="mr-2 h-4 w-4" />
                Ativar
              </DropdownMenuItem>
            )}

            {onDeactivate && row.original.status === 'Ativo' && (
              <DropdownMenuItem onClick={() => onDeactivate(row.original)}>
                <IconX className="mr-2 h-4 w-4" />
                Inativar
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
  ], [onEdit, onView, onDelete])

  // Aplicar filtros avançados aos dados
  const filteredData = React.useMemo(() => {
    if (filters.length === 0) return data

    return data.filter((cliente) => {
      return filters.every((filter) => {
        const column = columnsConfig.find(col => col.id === filter.columnId)
        if (!column) return true

        const value = column.accessor(cliente)

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
  const selectedClientes = selectedRows.map(row => row.original)

  const handleExport = () => {
    if (!onExportSelected) return

    const fileName = exportFileName.trim() || `clientes_${new Date().toISOString().split('T')[0]}`

    // Preparar dados com base nas colunas selecionadas
    const exportData = selectedClientes.map(cliente => {
      const row: any = {}

      if (exportColumns.tipo) row['Tipo'] = cliente.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'
      if (exportColumns.cnpj_cpf) row['CPF/CNPJ'] = cliente.cnpj_cpf
      if (exportColumns.razao_social) row['Razão Social'] = cliente.razao_social
      if (exportColumns.nome_fantasia) row['Nome Fantasia'] = cliente.nome_fantasia || ''
      if (exportColumns.ie) row['IE'] = cliente.ie || ''
      if (exportColumns.im) row['IM'] = cliente.im || ''
      if (exportColumns.email) row['Email'] = cliente.email || ''
      if (exportColumns.fone) row['Telefone'] = cliente.fone || ''
      if (exportColumns.celular) row['Celular'] = cliente.celular || ''
      if (exportColumns.logradouro) row['Logradouro'] = cliente.logradouro || ''
      if (exportColumns.numero) row['Número'] = cliente.numero || ''
      if (exportColumns.bairro) row['Bairro'] = cliente.bairro || ''
      if (exportColumns.municipio) row['Cidade'] = cliente.municipio || ''
      if (exportColumns.uf) row['UF'] = cliente.uf || ''
      if (exportColumns.cep) row['CEP'] = cliente.cep || ''
      if (exportColumns.status) row['Status'] = cliente.status

      return row
    })

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
                    <DropdownMenuItem onClick={() => onBulkActivate(selectedClientes)}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Ativar Selecionados
                    </DropdownMenuItem>
                  )}
                  {onBulkDeactivate && (
                    <DropdownMenuItem onClick={() => onBulkDeactivate(selectedClientes)}>
                      <IconX className="mr-2 h-4 w-4" />
                      Inativar Selecionados
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                onClick={() => onBulkDelete(selectedClientes)}
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
        {/* Primeira linha: Filtros avançados e ações */}
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
              Novo Cliente
            </Button>
          )}
          </div>
        </div>


      </div>

      {/* Tabela */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSelectColumn = header.column.id === 'select'
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`${header.column.getCanSort() ? "cursor-pointer select-none" : ""} ${isSelectColumn ? "text-center" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : isSelectColumn ? (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                  )
                })}
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === 'select'
                    return (
                      <TableCell
                        key={cell.id}
                        className={isSelectColumn ? "text-center" : ""}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Linhas por página
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para primeira página</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Exportação */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exportar para Excel</DialogTitle>
            <DialogDescription>
              Exportar {selectedRows.length} {selectedRows.length === 1 ? 'cliente' : 'clientes'} selecionado(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome do Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="fileName">Nome do arquivo</Label>
              <Input
                id="fileName"
                placeholder="Ex: clientes_janeiro_2025"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleExport()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar: clientes_{new Date().toISOString().split('T')[0]}
              </p>
            </div>

            {/* Seleção de Colunas */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-4">Selecione as colunas para exportar</h4>

              <div className="grid grid-cols-2 gap-6">
                {/* Coluna Esquerda - Dados Principais */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Dados Principais</p>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tipo"
                      checked={exportColumns.tipo}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, tipo: !!checked })
                      }
                    />
                    <Label htmlFor="tipo" className="text-sm font-normal cursor-pointer">
                      Tipo (PF/PJ)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cnpj_cpf"
                      checked={exportColumns.cnpj_cpf}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, cnpj_cpf: !!checked })
                      }
                    />
                    <Label htmlFor="cnpj_cpf" className="text-sm font-normal cursor-pointer">
                      CPF/CNPJ
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="razao_social"
                      checked={exportColumns.razao_social}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, razao_social: !!checked })
                      }
                    />
                    <Label htmlFor="razao_social" className="text-sm font-normal cursor-pointer">
                      Razão Social
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nome_fantasia"
                      checked={exportColumns.nome_fantasia}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, nome_fantasia: !!checked })
                      }
                    />
                    <Label htmlFor="nome_fantasia" className="text-sm font-normal cursor-pointer">
                      Nome Fantasia
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ie"
                      checked={exportColumns.ie}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, ie: !!checked })
                      }
                    />
                    <Label htmlFor="ie" className="text-sm font-normal cursor-pointer">
                      Inscrição Estadual
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="im"
                      checked={exportColumns.im}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, im: !!checked })
                      }
                    />
                    <Label htmlFor="im" className="text-sm font-normal cursor-pointer">
                      Inscrição Municipal
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status"
                      checked={exportColumns.status}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, status: !!checked })
                      }
                    />
                    <Label htmlFor="status" className="text-sm font-normal cursor-pointer">
                      Status
                    </Label>
                  </div>
                </div>

                {/* Coluna Direita - Contato e Endereço */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Contato e Endereço</p>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={exportColumns.email}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, email: !!checked })
                      }
                    />
                    <Label htmlFor="email" className="text-sm font-normal cursor-pointer">
                      Email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fone"
                      checked={exportColumns.fone}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, fone: !!checked })
                      }
                    />
                    <Label htmlFor="fone" className="text-sm font-normal cursor-pointer">
                      Telefone
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="celular"
                      checked={exportColumns.celular}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, celular: !!checked })
                      }
                    />
                    <Label htmlFor="celular" className="text-sm font-normal cursor-pointer">
                      Celular
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="logradouro"
                      checked={exportColumns.logradouro}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, logradouro: !!checked })
                      }
                    />
                    <Label htmlFor="logradouro" className="text-sm font-normal cursor-pointer">
                      Logradouro
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numero"
                      checked={exportColumns.numero}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, numero: !!checked })
                      }
                    />
                    <Label htmlFor="numero" className="text-sm font-normal cursor-pointer">
                      Número
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bairro"
                      checked={exportColumns.bairro}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, bairro: !!checked })
                      }
                    />
                    <Label htmlFor="bairro" className="text-sm font-normal cursor-pointer">
                      Bairro
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="municipio"
                      checked={exportColumns.municipio}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, municipio: !!checked })
                      }
                    />
                    <Label htmlFor="municipio" className="text-sm font-normal cursor-pointer">
                      Cidade
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uf"
                      checked={exportColumns.uf}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, uf: !!checked })
                      }
                    />
                    <Label htmlFor="uf" className="text-sm font-normal cursor-pointer">
                      UF
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cep"
                      checked={exportColumns.cep}
                      onCheckedChange={(checked) =>
                        setExportColumns({ ...exportColumns, cep: !!checked })
                      }
                    />
                    <Label htmlFor="cep" className="text-sm font-normal cursor-pointer">
                      CEP
                    </Label>
                  </div>
                </div>
              </div>
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
