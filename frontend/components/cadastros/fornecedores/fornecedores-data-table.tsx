"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { IconDots, IconEdit, IconTrash, IconEye } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FornecedorService, type Fornecedor } from "@/lib/services/fornecedor.service"
import { FornecedorFormDialog } from "./fornecedor-form-dialog"

export function FornecedoresDataTable() {
  const [data, setData] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFornecedorId, setEditingFornecedorId] = useState<string | undefined>()

const columns: ColumnDef<Fornecedor>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "documento",
    header: "Documento",
    cell: ({ row }) => {
      const documento = row.getValue("documento") as string
      const tipo = row.original.tipo
      
      const formatDocument = (doc: string, type: string) => {
        if (type === 'FISICA') {
          return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        } else {
          return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        }
      }

      return <div className="font-mono">{formatDocument(documento, tipo)}</div>
    },
  },
  {
    accessorKey: "nome",
    header: "Nome/Razão Social",
    cell: ({ row }) => {
      const nome = row.getValue("nome") as string
      const nomeFantasia = row.original.nomeFantasia
      
      return (
        <div>
          <div className="font-medium">{nome}</div>
          {nomeFantasia && (
            <div className="text-sm text-muted-foreground">{nomeFantasia}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string
      return (
        <Badge variant={tipo === "JURIDICA" ? "default" : "secondary"}>
          {tipo === "JURIDICA" ? "PJ" : "PF"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return email ? (
        <div className="text-sm">{email}</div>
      ) : (
        <div className="text-sm text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => {
      const telefone = row.getValue("telefone") as string
      const celular = row.original.celular
      
      return (
        <div className="text-sm">
          {telefone && <div>{telefone}</div>}
          {celular && <div className="text-muted-foreground">{celular}</div>}
          {!telefone && !celular && <div className="text-muted-foreground">-</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.getValue("ativo") as boolean
      return (
        <Badge variant={ativo ? "default" : "secondary"}>
          {ativo ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const fornecedor = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(fornecedor.id)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingFornecedorId(fornecedor.id)
                setDialogOpen(true)
              }}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <IconTrash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await FornecedorService.getAll(
        pagination.pageIndex + 1,
        pagination.pageSize
      )
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
      // Dados mock para demonstração
      setData([
        {
          id: '1',
          tipo: 'JURIDICA',
          documento: '12345678000195',
          nome: 'Fornecedor Exemplo Ltda',
          nomeFantasia: 'Fornecedor Exemplo',
          logradouro: 'Rua das Empresas, 456',
          numero: '456',
          bairro: 'Centro',
          cep: '01000-000',
          municipioId: '1',
          estadoId: '1',
          email: 'contato@fornecedor.com',
          telefone: '(11) 3333-4444',
          ativo: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [pagination.pageIndex, pagination.pageSize])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <>
    <Card className="mx-4 lg:mx-6">
      <CardHeader>
        <CardTitle>Fornecedores</CardTitle>
        <CardDescription>
          Gerencie os fornecedores da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrar fornecedores..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nome")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button
            className="ml-auto"
            onClick={() => {
              setEditingFornecedorId(undefined)
              setDialogOpen(true)
            }}
          >
            Novo Fornecedor
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                    {loading ? "Carregando..." : "Nenhum resultado encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <FornecedorFormDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      fornecedorId={editingFornecedorId}
      onSuccess={() => {
        loadData()
      }}
    />
    </>
  )
}
