'use client';

import * as React from 'react';
import { Cliente } from '@/lib/services/cliente.service';
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
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pencil,
  Trash2,
  Search,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Hash,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDataTableFilters, DataTableFilter } from '@/components/data-table-filter';
import type { ColumnConfig } from '@/components/data-table-filter/core/types';

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
  onView?: (cliente: Cliente) => void;
  loading?: boolean;
}

// Configuração das colunas para o sistema de filtros
const filterColumnsConfig: ColumnConfig<Cliente>[] = [
  {
    id: 'razao_social',
    accessor: (cliente) => (cliente as any).razao_social || (cliente as any).nome || '',
    displayName: 'Razão Social/Nome',
    icon: User,
    type: 'text',
  },
  {
    id: 'cnpj_cpf',
    accessor: (cliente) => (cliente as any).cnpj_cpf || (cliente as any).cpf || '',
    displayName: 'CNPJ/CPF',
    icon: Hash,
    type: 'text',
  },
  {
    id: 'email',
    accessor: (cliente) => cliente.email || '',
    displayName: 'Email',
    icon: Mail,
    type: 'text',
  },
  {
    id: 'telefone',
    accessor: (cliente) => cliente.celular || cliente.telefone_fixo || '',
    displayName: 'Telefone',
    icon: Phone,
    type: 'text',
  },
  {
    id: 'cidade',
    accessor: (cliente) => cliente.cidade || '',
    displayName: 'Cidade',
    icon: MapPin,
    type: 'option',
    options: [], // Será preenchido dinamicamente
  },
  {
    id: 'estado',
    accessor: (cliente) => cliente.estado || '',
    displayName: 'Estado',
    icon: MapPin,
    type: 'option',
    options: [], // Será preenchido dinamicamente
  },
  {
    id: 'status',
    accessor: (cliente) => cliente.status,
    displayName: 'Status',
    icon: Building,
    type: 'option',
    options: [
      { label: 'Ativo', value: 'ativo' },
      { label: 'Inativo', value: 'inativo' },
      { label: 'Bloqueado', value: 'bloqueado' },
    ],
  },
  {
    id: 'tipo_contato',
    accessor: (cliente) => cliente.tipo_contato,
    displayName: 'Tipo de Contato',
    icon: User,
    type: 'option',
    options: [
      { label: 'Pessoa Física', value: 'pessoa_fisica' },
      { label: 'Pessoa Jurídica', value: 'pessoa_juridica' },
    ],
  },
  {
    id: 'data_cadastro',
    accessor: (cliente) => new Date(cliente.data_cadastro),
    displayName: 'Data de Cadastro',
    icon: Calendar,
    type: 'date',
  },
  {
    id: 'limite_credito',
    accessor: (cliente) => parseFloat(cliente.limite_credito || '0'),
    displayName: 'Limite de Crédito',
    icon: CreditCard,
    type: 'number',
  },
];

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export function ClientesTable({ clientes, onEdit, onDelete, onView, loading }: ClientesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [clienteToDelete, setClienteToDelete] = React.useState<Cliente | null>(null);

  // Preparar opções dinâmicas para cidades e estados
  const cidadesUnicas = React.useMemo(() => {
    const cidades = clientes
      .map(c => c.cidade)
      .filter(Boolean)
      .filter((cidade, index, arr) => arr.indexOf(cidade) === index)
      .sort();
    return cidades.map(cidade => ({ label: cidade!, value: cidade! }));
  }, [clientes]);

  const estadosUnicos = React.useMemo(() => {
    const estados = clientes
      .map(c => c.estado)
      .filter(Boolean)
      .filter((estado, index, arr) => arr.indexOf(estado) === index)
      .sort();
    return estados.map(estado => ({ label: estado!, value: estado! }));
  }, [clientes]);

  // Configuração das colunas com opções dinâmicas
  const columnsConfigWithOptions = React.useMemo(() => {
    return filterColumnsConfig.map(config => {
      if (config.id === 'cidade') {
        return { ...config, options: cidadesUnicas };
      }
      if (config.id === 'estado') {
        return { ...config, options: estadosUnicos };
      }
      return config;
    });
  }, [cidadesUnicas, estadosUnicos]);

  // Hook do sistema de filtros
  const { columns: filterColumns, filters, actions } = useDataTableFilters({
    strategy: 'client',
    data: clientes,
    columnsConfig: columnsConfigWithOptions,
  });

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clienteToDelete) {
      onDelete(clienteToDelete.id);
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  const columns: ColumnDef<Cliente>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'razao_social',
      header: 'Razão Social/Nome',
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const nome = clienteData.razao_social || clienteData.nome || '-';
        return <div className="font-medium">{nome}</div>;
      },
      enableHiding: false,
    },
    {
      accessorKey: 'cnpj_cpf',
      header: 'CNPJ/CPF',
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const cpf = clienteData.cnpj_cpf || clienteData.cpf || '-';
        return <div>{cpf}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.original.email || '-'}</div>,
    },
    {
      accessorKey: 'celular',
      header: 'Telefone',
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const celular = clienteData.celular || '';
        const fone = clienteData.fone || clienteData.telefone_fixo || '';
        return <div>{formatPhone(celular || fone)}</div>;
      },
    },
    {
      accessorKey: 'municipio',
      header: 'Cidade',
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const cidade = clienteData.municipio || clienteData.cidade || '-';
        return <div>{cidade}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Ativo' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(cliente)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(cliente)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(cliente)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Aplicar filtros do sistema de filtros avançados
  const filteredData = React.useMemo(() => {
    if (filters.length === 0) return clientes;

    return clientes.filter(cliente => {
      return filters.every(filter => {
        const column = filterColumns.find(col => col.id === filter.columnId);
        if (!column) return true;

        const value = column.accessor(cliente);
        const filterValues = filter.values;

        switch (filter.type) {
          case 'text':
            const textValue = String(value).toLowerCase();
            const searchText = String(filterValues[0] || '').toLowerCase();
            if (filter.operator === 'contains') {
              return textValue.includes(searchText);
            } else if (filter.operator === 'does not contain') {
              return !textValue.includes(searchText);
            }
            return true;

          case 'option':
            const optionValue = String(value);
            if (filter.operator === 'is') {
              return filterValues.includes(optionValue);
            } else if (filter.operator === 'is not') {
              return !filterValues.includes(optionValue);
            } else if (filter.operator === 'is any of') {
              return filterValues.includes(optionValue);
            } else if (filter.operator === 'is none of') {
              return !filterValues.includes(optionValue);
            }
            return true;

          case 'date':
            const dateValue = new Date(value as Date);
            const filterDate = filterValues[0] as Date;
            const filterDate2 = filterValues[1] as Date;

            if (filter.operator === 'is') {
              return dateValue.toDateString() === filterDate.toDateString();
            } else if (filter.operator === 'is not') {
              return dateValue.toDateString() !== filterDate.toDateString();
            } else if (filter.operator === 'is before') {
              return dateValue < filterDate;
            } else if (filter.operator === 'is after') {
              return dateValue > filterDate;
            } else if (filter.operator === 'is on or after') {
              return dateValue >= filterDate;
            } else if (filter.operator === 'is on or before') {
              return dateValue <= filterDate;
            } else if (filter.operator === 'is between') {
              return dateValue >= filterDate && dateValue <= filterDate2;
            } else if (filter.operator === 'is not between') {
              return !(dateValue >= filterDate && dateValue <= filterDate2);
            }
            return true;

          case 'number':
            const numberValue = Number(value);
            const filterNumber = Number(filterValues[0]);
            const filterNumber2 = Number(filterValues[1]);

            if (filter.operator === 'is') {
              return numberValue === filterNumber;
            } else if (filter.operator === 'is not') {
              return numberValue !== filterNumber;
            } else if (filter.operator === 'is greater than') {
              return numberValue > filterNumber;
            } else if (filter.operator === 'is greater than or equal to') {
              return numberValue >= filterNumber;
            } else if (filter.operator === 'is less than') {
              return numberValue < filterNumber;
            } else if (filter.operator === 'is less than or equal to') {
              return numberValue <= filterNumber;
            } else if (filter.operator === 'is between') {
              return numberValue >= filterNumber && numberValue <= filterNumber2;
            } else if (filter.operator === 'is not between') {
              return !(numberValue >= filterNumber && numberValue <= filterNumber2);
            }
            return true;

          default:
            return true;
        }
      });
    });
  }, [clientes, filters, filterColumns]);

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
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar com Filtros e Controles */}
      <div className="flex flex-col gap-4">
        {/* Linha principal com filtros e botões */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Sistema de Filtros Avançados */}
          <div className="flex-1 min-w-0">
            <DataTableFilter
              columns={filterColumns}
              filters={filters}
              actions={actions}
              strategy="client"
              locale="pt"
            />
          </div>

          {/* Controles da tabela */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Columns3 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Colunas</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Mostrar/Ocultar Colunas
                </div>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnNames: Record<string, string> = {
                      'razao_social': 'Razão Social/Nome',
                      'cnpj_cpf': 'CNPJ/CPF',
                      'email': 'Email',
                      'telefone': 'Telefone',
                      'cidade': 'Cidade',
                      'status': 'Status',
                      'data_cadastro': 'Data Cadastro',
                      'actions': 'Ações'
                    };

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {columnNames[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Informações de status (apenas quando há filtros ativos) */}
        {filters.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
            <span>
              Mostrando {filteredData.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {filters.length} filtro{filters.length !== 1 ? 's' : ''} aplicado{filters.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
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
                  );
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
                  data-state={row.getIsSelected() && 'selected'}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
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
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
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
            Página {table.getState().pagination.pageIndex + 1} de{' '}
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
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente{' '}
              <strong>
                {clienteToDelete && ((clienteToDelete as any).razao_social || clienteToDelete.nome)}
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

