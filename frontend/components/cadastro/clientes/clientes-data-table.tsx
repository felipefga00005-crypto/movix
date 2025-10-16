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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
}: ClientesDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
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
          <DropdownMenuContent align="end" className="w-32">
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

  return (
    <div className="space-y-3">
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
          <Button variant="outline" className="h-7">
            <IconDownload className="mr-2 h-4 w-4" />
            Exportar
          </Button>
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
    </div>
  )
}
