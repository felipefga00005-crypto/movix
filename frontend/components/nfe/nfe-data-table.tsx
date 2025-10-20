"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconEye,
  IconEdit,
  IconSend,
  IconDownload,
  IconFileText,
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
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import Link from "next/link"

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { NfeService, type Nfe } from "@/lib/services/nfe.service"
import { EmitenteService, type Emitente } from "@/lib/services/emitente.service"

const statusColors = {
  DIGITACAO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  AUTORIZADA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CANCELADA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  REJEITADA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusLabels = {
  DIGITACAO: "Digitação",
  AUTORIZADA: "Autorizada",
  CANCELADA: "Cancelada",
  REJEITADA: "Rejeitada",
}

const columns: ColumnDef<Nfe>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.numero.toString().padStart(9, '0')}
      </div>
    ),
  },
  {
    accessorKey: "cliente.nome",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-32 truncate">
        {row.original.cliente?.nome || '-'}
      </div>
    ),
  },
  {
    accessorKey: "emitente.razaoSocial",
    header: "Emitente",
    cell: ({ row }) => (
      <div className="max-w-32 truncate">
        {row.original.emitente?.razaoSocial || '-'}
      </div>
    ),
  },
  {
    accessorKey: "dataEmissao",
    header: "Data Emissão",
    cell: ({ row }) => (
      <div>
        {new Date(row.original.dataEmissao).toLocaleDateString('pt-BR')}
      </div>
    ),
  },
  {
    accessorKey: "valorTotal",
    header: () => <div className="text-right">Valor Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(row.original.valorTotal)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status]}>
        {statusLabels[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "chave",
    header: "Chave",
    cell: ({ row }) => (
      <div className="font-mono text-xs max-w-32 truncate">
        {row.original.chave || '-'}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const nfe = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/nfes/${nfe.id}`}>
                <IconEye className="mr-2 h-4 w-4" />
                Visualizar
              </Link>
            </DropdownMenuItem>
            {nfe.status === 'DIGITACAO' && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/nfes/${nfe.id}/editar`}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconSend className="mr-2 h-4 w-4" />
                  Transmitir
                </DropdownMenuItem>
              </>
            )}
            {nfe.chave && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconDownload className="mr-2 h-4 w-4" />
                  Baixar XML
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconFileText className="mr-2 h-4 w-4" />
                  Baixar PDF
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function NfeDataTable() {
  const [data, setData] = useState<Nfe[]>([])
  const [emitentes, setEmitentes] = useState<Emitente[]>([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
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

  useEffect(() => {
    loadData()
  }, [pagination.pageIndex, pagination.pageSize])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await NfeService.getAll(
        pagination.pageIndex + 1,
        pagination.pageSize
      )
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar NFes:', error)
      // Dados mock para demonstração
      setData([
        {
          id: '1',
          numero: 1,
          serie: 1,
          emitenteId: '1',
          clienteId: '1',
          naturezaOperacao: 'Venda de mercadoria',
          tipoOperacao: 1,
          consumidorFinal: 1,
          presencaComprador: 1,
          dataEmissao: new Date().toISOString(),
          valorTotal: 2800.00,
          valorTotalProdutos: 2800.00,
          valorTotalTributos: 504.00,
          status: 'AUTORIZADA' as const,
          chave: '35241055532459000128550010000000011123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cliente: {
            id: '1',
            nome: 'João da Silva',
            documento: '12345678901',
            tipo: 'FISICA',
          },
          emitente: {
            id: '1',
            razaoSocial: '55.532.459 JAYANDSON CIRQUEIRA DA SILVA',
            cnpj: '55532459000128',
          },
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="todas" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
          <TabsTrigger value="todas">Todas as NFes</TabsTrigger>
          <TabsTrigger value="digitacao">
            Em Digitação <Badge variant="secondary">45</Badge>
          </TabsTrigger>
          <TabsTrigger value="autorizadas">
            Autorizadas <Badge variant="secondary">1180</Badge>
          </TabsTrigger>
          <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Colunas</span>
                <IconChevronDown />
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
          <Button asChild size="sm">
            <Link href="/nfes/nova">
              <IconPlus />
              <span className="hidden lg:inline">Nova NFe</span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsContent
        value="todas"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhuma NFe encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
                <span className="sr-only">Página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Próxima página</span>
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
      </TabsContent>
    </Tabs>
  )
}
