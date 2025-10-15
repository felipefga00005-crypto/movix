'use client';

import * as React from 'react';
import { Cliente } from '@/lib/services/cliente.service';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnPinningState,
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
  Download,
  FileSpreadsheet,
  FileText,
  Pin,
  PinOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  UserX,
  Users,
  Archive,
  Plus,
  RotateCcw,
  CheckSquare,
  X,
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { exportToExcel, exportToPDF, formatters, type ExportColumn } from '@/lib/utils/excel-export';
import { ExportDialog } from '@/components/ui/export-dialog';

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
  onView?: (cliente: Cliente) => void;
  loading?: boolean;
  onBulkDelete?: (ids: number[]) => void;
  onBulkStatusChange?: (ids: number[], status: string) => void;
  onBulkExport?: (clientes: Cliente[]) => void;
  onCreate?: () => void;
}

// Configuração das colunas para o sistema de filtros
const filterColumnsConfig: ColumnConfig<Cliente>[] = [
  {
    id: 'razao_social',
    accessor: (cliente) => (cliente as any).razao_social || '',
    displayName: 'Razão Social/Nome',
    icon: User,
    type: 'text',
  },
  {
    id: 'cnpj_cpf',
    accessor: (cliente) => (cliente as any).cnpj_cpf || '',
    displayName: 'CNPJ/CPF',
    icon: Hash,
    type: 'text',
  },
  {
    id: 'email',
    accessor: (cliente) => (cliente as any).email || '',
    displayName: 'Email',
    icon: Mail,
    type: 'text',
  },
  {
    id: 'telefone',
    accessor: (cliente) => (cliente as any).celular || (cliente as any).fone || '',
    displayName: 'Telefone',
    icon: Phone,
    type: 'text',
  },
  {
    id: 'municipio',
    accessor: (cliente) => (cliente as any).municipio || '',
    displayName: 'Cidade',
    icon: MapPin,
    type: 'option',
    options: [], // Será preenchido dinamicamente
  },
  {
    id: 'uf',
    accessor: (cliente) => (cliente as any).uf || '',
    displayName: 'Estado',
    icon: MapPin,
    type: 'option',
    options: [], // Será preenchido dinamicamente
  },
  {
    id: 'status',
    accessor: (cliente) => (cliente as any).status || '',
    displayName: 'Status',
    icon: Building,
    type: 'option',
    options: [
      { label: 'Ativo', value: 'Ativo' },
      { label: 'Inativo', value: 'Inativo' },
      { label: 'Bloqueado', value: 'Bloqueado' },
    ],
  },
  {
    id: 'tipo_contato',
    accessor: (cliente) => (cliente as any).tipo_contato || '',
    displayName: 'Tipo de Contato',
    icon: User,
    type: 'option',
    options: [
      { label: 'Cliente', value: 'Cliente' },
      { label: 'Fornecedor', value: 'Fornecedor' },
      { label: 'Transportadora', value: 'Transportadora' },
    ],
  },
  {
    id: 'created_at',
    accessor: (cliente) => new Date((cliente as any).created_at),
    displayName: 'Data de Cadastro',
    icon: Calendar,
    type: 'date',
  },
  {
    id: 'limite_credito',
    accessor: (cliente) => parseFloat((cliente as any).limite_credito || '0'),
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

export function ClientesTable({
  clientes,
  onEdit,
  onDelete,
  onView,
  loading,
  onBulkDelete,
  onBulkStatusChange,
  onBulkExport,
  onCreate
}: ClientesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select', 'razao_social'], // Fixar checkbox e nome por padrão
    right: ['actions'], // Fixar ações à direita
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [clienteToDelete, setClienteToDelete] = React.useState<Cliente | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [selectAllMode, setSelectAllMode] = React.useState<'page' | 'all'>('page');
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<'excel' | 'pdf'>('excel');

  // Preparar opções dinâmicas para cidades e estados
  const cidadesUnicas = React.useMemo(() => {
    const cidades = clientes
      .map(c => (c as any).municipio)
      .filter(Boolean)
      .filter((cidade, index, arr) => arr.indexOf(cidade) === index)
      .sort();
    return cidades.map(cidade => ({ label: cidade!, value: cidade! }));
  }, [clientes]);

  const estadosUnicos = React.useMemo(() => {
    const estados = clientes
      .map(c => (c as any).uf)
      .filter(Boolean)
      .filter((estado, index, arr) => arr.indexOf(estado) === index)
      .sort();
    return estados.map(estado => ({ label: estado!, value: estado! }));
  }, [clientes]);

  // Configuração das colunas com opções dinâmicas
  const columnsConfigWithOptions = React.useMemo(() => {
    return filterColumnsConfig.map(config => {
      if (config.id === 'municipio') {
        return { ...config, options: cidadesUnicas };
      }
      if (config.id === 'uf') {
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

  // Configuração das colunas para exportação (apenas dados relevantes para relatórios)
  const exportColumns: ExportColumn[] = React.useMemo(() => [
    { key: 'razao_social', label: 'Razão Social/Nome' },
    { key: 'cnpj_cpf', label: 'CNPJ/CPF', formatter: formatters.cpfCnpj },
    { key: 'email', label: 'Email' },
    { key: 'celular', label: 'Celular', formatter: formatters.phone },
    { key: 'fone', label: 'Telefone Fixo', formatter: formatters.phone },
    { key: 'municipio', label: 'Cidade' },
    { key: 'uf', label: 'Estado' },
    { key: 'logradouro', label: 'Endereço' },
    { key: 'numero', label: 'Número' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'cep', label: 'CEP' },
    { key: 'complemento', label: 'Complemento' },
    { key: 'status', label: 'Status' },
    { key: 'tipo_contato', label: 'Tipo de Contato' },
    { key: 'consumidor_final', label: 'Consumidor Final', formatter: formatters.boolean },
    { key: 'limite_credito', label: 'Limite de Crédito', formatter: formatters.currency },
    { key: 'ie', label: 'Inscrição Estadual' },
    { key: 'im', label: 'Inscrição Municipal' },
    { key: 'data_nascimento', label: 'Data de Nascimento', formatter: formatters.date },
  ], []);

  // Componente de cabeçalho sortável com opção de fixar
  const SortableHeader = ({ column, children, className = "" }: {
    column: any;
    children: React.ReactNode;
    className?: string;
  }) => {
    const sorted = column.getIsSorted();
    const isPinned = column.getIsPinned();
    const canPin = column.getCanPin();
    const canSort = column.getCanSort();

    return (
      <div className="flex items-center justify-between w-full">
        {canSort ? (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(sorted === "asc")}
            className={`h-auto p-0 font-semibold hover:bg-transparent justify-start flex-1 ${className}`}
          >
            {children}
            <div className="ml-2 flex flex-col">
              {sorted === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : sorted === "desc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </div>
          </Button>
        ) : (
          <div className={`font-semibold flex-1 ${className}`}>
            {children}
          </div>
        )}

        {canPin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isPinned ? (
                  <Pin className="h-3 w-3 text-blue-600" />
                ) : (
                  <MoreVertical className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => column.pin('left')}
                disabled={isPinned === 'left'}
              >
                <Pin className="mr-2 h-4 w-4" />
                Fixar à esquerda
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.pin('right')}
                disabled={isPinned === 'right'}
              >
                <Pin className="mr-2 h-4 w-4 rotate-180" />
                Fixar à direita
              </DropdownMenuItem>
              {isPinned && (
                <DropdownMenuItem onClick={() => column.pin(false)}>
                  <PinOff className="mr-2 h-4 w-4" />
                  Desfixar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  const columns: ColumnDef<Cliente>[] = [
    {
      id: 'select',
      header: ({ table }) => {
        const handleSelectToggle = () => {
          if (selectAllMode === 'all') {
            // Se todos estão selecionados, limpar seleção
            handleClearSelection();
          } else if (table.getIsAllPageRowsSelected()) {
            // Se todos da página estão selecionados, selecionar todos os filtrados
            handleSelectAllFiltered();
          } else {
            // Selecionar todos da página atual
            table.toggleAllPageRowsSelected(true);
            setSelectAllMode('page');
          }
        };

        const isAllPageSelected = table.getIsAllPageRowsSelected();
        const isAllFilteredSelected = selectAllMode === 'all';
        const hasSomeSelected = table.getIsSomePageRowsSelected();

        // Checkbox só fica marcado quando TODOS os filtrados estão selecionados
        const isChecked = isAllFilteredSelected;

        // Estado indeterminado quando:
        // 1. Alguns itens da página estão selecionados (mas não todos) OU
        // 2. Todos da página estão selecionados mas não todos os filtrados
        const isIndeterminate = (hasSomeSelected && !isAllFilteredSelected) || (isAllPageSelected && !isAllFilteredSelected);

        return (
          <div className="flex items-center justify-center w-10">
            <Checkbox
              checked={isChecked}
              ref={(el) => {
                if (el) {
                  const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                  if (checkbox) checkbox.indeterminate = isIndeterminate;
                }
              }}
              onCheckedChange={handleSelectToggle}
              aria-label={
                isAllFilteredSelected
                  ? "Todos os filtrados selecionados - clique para limpar"
                  : isAllPageSelected
                    ? "Página selecionada - clique para selecionar todos os filtrados"
                    : "Selecionar página atual"
              }
              className={isAllFilteredSelected ? "data-[state=checked]:bg-blue-600" : ""}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-10">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50, // Largura fixa pequena para checkbox
      minSize: 50,
      maxSize: 50,
    },
    {
      accessorKey: 'razao_social',
      header: ({ column }) => (
        <SortableHeader column={column}>
          Razão Social/Nome
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const nome = clienteData.razao_social || clienteData.nome || '-';
        return <div className="font-medium">{nome}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).razao_social || (rowA.original as any).nome || '';
        const b = (rowB.original as any).razao_social || (rowB.original as any).nome || '';
        return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
      },
      enableSorting: true,
      enableHiding: false,
      size: 200, // Largura inicial para nome/razão social
      minSize: 150,
    },
    {
      accessorKey: 'cnpj_cpf',
      header: ({ column }) => (
        <SortableHeader column={column}>
          CNPJ/CPF
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const cpf = clienteData.cnpj_cpf || clienteData.cpf || '-';
        return <div>{cpf}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).cnpj_cpf || (rowA.original as any).cpf || '';
        const b = (rowB.original as any).cnpj_cpf || (rowB.original as any).cpf || '';
        return a.localeCompare(b, 'pt-BR', { numeric: true });
      },
      enableSorting: true,
      size: 130, // Largura inicial para CNPJ/CPF
      minSize: 100,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <SortableHeader column={column}>
          Email
        </SortableHeader>
      ),
      cell: ({ row }) => <div>{(row.original as any).email || '-'}</div>,
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).email || '';
        const b = (rowB.original as any).email || '';
        return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
      },
      enableSorting: true,
      size: 180, // Largura inicial para email
      minSize: 120,
    },
    {
      accessorKey: 'celular',
      header: ({ column }) => (
        <SortableHeader column={column}>
          Telefone
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const celular = clienteData.celular || '';
        const fone = clienteData.fone || clienteData.telefone_fixo || '';
        return <div>{formatPhone(celular || fone)}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).celular || (rowA.original as any).fone || '';
        const b = (rowB.original as any).celular || (rowB.original as any).fone || '';
        return a.localeCompare(b, 'pt-BR', { numeric: true });
      },
      enableSorting: true,
      size: 120, // Largura inicial para telefone
      minSize: 100,
    },
    {
      accessorKey: 'municipio',
      header: ({ column }) => (
        <SortableHeader column={column}>
          Cidade
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const clienteData = row.original as any;
        const cidade = clienteData.municipio || clienteData.cidade || '-';
        return <div>{cidade}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).municipio || (rowA.original as any).cidade || '';
        const b = (rowB.original as any).municipio || (rowB.original as any).cidade || '';
        return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
      },
      enableSorting: true,
      size: 120, // Largura inicial para cidade
      minSize: 100,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column}>
          Status
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <Badge variant={(row.original as any).status === 'Ativo' ? 'default' : 'secondary'}>
          {(row.original as any).status}
        </Badge>
      ),
      sortingFn: (rowA, rowB) => {
        const a = (rowA.original as any).status || '';
        const b = (rowB.original as any).status || '';
        return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
      },
      enableSorting: true,
      size: 100, // Largura inicial para status
      minSize: 80,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <div className="w-20 text-center">
          <SortableHeader column={column}>
            Ações
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <div className="flex items-center justify-center w-20">
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
          </div>
        );
      },
      enableSorting: false,
      size: 70, // Largura fixa para ações
      minSize: 70,
      maxSize: 70,
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
      columnPinning,
    },
    enableRowSelection: true,
    enableColumnPinning: true,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      size: 150, // Tamanho padrão
      minSize: 50, // Tamanho mínimo
      maxSize: 500, // Tamanho máximo
    },
  });

  // Funções para ações em massa (após declaração da tabela)
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedClientes = selectedRows.map(row => row.original);
  const selectedIds = selectedClientes.map(cliente => cliente.id);
  const hasSelection = selectedRows.length > 0;

  // Verificar se todos os itens da página estão selecionados
  const currentPageRows = table.getRowModel().rows;
  const allPageItemsSelected = currentPageRows.length > 0 && currentPageRows.every(row => row.getIsSelected());

  // Verificar se todos os itens filtrados estão selecionados
  const allFilteredRows = table.getFilteredRowModel().rows;
  const allFilteredItemsSelected = allFilteredRows.length > 0 && allFilteredRows.every(row => row.getIsSelected());

  // Determinar o texto e ações baseado no modo de seleção
  const getSelectionInfo = () => {
    if (selectAllMode === 'all' && allPageItemsSelected && !allFilteredItemsSelected) {
      return {
        count: filteredData.length,
        text: `Todos os ${filteredData.length} clientes filtrados selecionados`,
        isAllMode: true
      };
    }
    return {
      count: selectedRows.length,
      text: `${selectedRows.length} cliente${selectedRows.length !== 1 ? 's' : ''} selecionado${selectedRows.length !== 1 ? 's' : ''}`,
      isAllMode: false
    };
  };

  const selectionInfo = getSelectionInfo();

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete = selectionInfo.isAllMode
      ? filteredData.map(cliente => cliente.id)
      : selectedIds;

    if (onBulkDelete && idsToDelete.length > 0) {
      onBulkDelete(idsToDelete);
      setRowSelection({});
      setSelectAllMode('page');
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    const idsToUpdate = selectionInfo.isAllMode
      ? filteredData.map(cliente => cliente.id)
      : selectedIds;

    if (onBulkStatusChange && idsToUpdate.length > 0) {
      onBulkStatusChange(idsToUpdate, status);
      setRowSelection({});
      setSelectAllMode('page');
    }
  };

  const handleBulkExport = () => {
    const clientesToExport = selectionInfo.isAllMode
      ? filteredData
      : selectedClientes;

    if (onBulkExport && clientesToExport.length > 0) {
      onBulkExport(clientesToExport);
    } else {
      // Fallback para exportação direta (apenas dados essenciais)
      const exportColumns: ExportColumn[] = [
        { key: 'razao_social', label: 'Razão Social/Nome' },
        { key: 'cnpj_cpf', label: 'CNPJ/CPF', formatter: formatters.cpfCnpj },
        { key: 'email', label: 'Email' },
        { key: 'celular', label: 'Celular', formatter: formatters.phone },
        { key: 'municipio', label: 'Cidade' },
        { key: 'status', label: 'Status' },
      ];

      exportToExcel(clientesToExport, {
        filename: `clientes_selecionados`,
        sheetName: 'Clientes Selecionados',
        columns: exportColumns,
      });
    }
  };

  const handleBulkExportFormat = (format: 'excel' | 'pdf') => {
    const clientesToExport = selectionInfo.isAllMode
      ? filteredData
      : selectedClientes;

    if (clientesToExport.length === 0) {
      return;
    }

    // Definir formato de exportação e abrir modal
    setExportFormat(format);
    setExportDialogOpen(true);
  };

  const handleExportWithColumns = (selectedColumns: ExportColumn[]) => {
    const clientesToExport = selectionInfo.isAllMode
      ? filteredData
      : selectedClientes;

    if (clientesToExport.length === 0) {
      return;
    }

    const filename = `clientes_selecionados_${new Date().toISOString().split('T')[0]}`;

    if (exportFormat === 'excel') {
      exportToExcel(clientesToExport, {
        filename,
        sheetName: 'Clientes Selecionados',
        columns: selectedColumns,
      });
    } else if (exportFormat === 'pdf') {
      exportToPDF(clientesToExport, {
        filename,
        title: 'Clientes Selecionados',
        columns: selectedColumns,
      });
    }

    setExportDialogOpen(false);
  };

  const handleClearSelection = () => {
    setRowSelection({});
    setSelectAllMode('page');
  };

  const handleSelectAllFiltered = () => {
    // Selecionar todos os itens filtrados
    const allFilteredIds = filteredData.reduce((acc, cliente, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setRowSelection(allFilteredIds);
    setSelectAllMode('all');
  };

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
            {/* Botão de Colunas */}
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
                      'celular': 'Telefone',
                      'municipio': 'Cidade',
                      'status': 'Status',
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

            {/* Botão Novo Cliente */}
            {onCreate && (
              <Button onClick={onCreate} size="sm" className="whitespace-nowrap">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Novo Cliente</span>
              </Button>
            )}
          </div>
        </div>

        {/* Barra de Ações em Massa */}
        {hasSelection && (
          <div className={`flex items-center justify-between px-3 py-2 rounded-md animate-in slide-in-from-top-2 duration-200 ${
            selectionInfo.isAllMode
              ? 'bg-blue-50/50 border border-blue-200/50'
              : 'bg-muted/30 border border-border/50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded ${
                selectionInfo.isAllMode
                  ? 'bg-blue-100/70'
                  : 'bg-primary/5'
              }`}>
                {selectionInfo.isAllMode ? (
                  <Users className="h-3 w-3 text-blue-600" />
                ) : (
                  <CheckSquare className="h-3 w-3 text-primary" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {selectionInfo.text}
                </span>
                <span className="text-xs text-muted-foreground/80">
                  {selectionInfo.isAllMode
                    ? "Todos os clientes filtrados serão afetados"
                    : "Escolha uma ação para aplicar aos itens selecionados"
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Ações de Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <UserCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">Status</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('Ativo')} className="gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-sm">
                      <UserCheck className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Ativar</span>
                      <span className="text-xs text-muted-foreground">Marcar como ativo</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('Inativo')} className="gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-sm">
                      <UserX className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Inativar</span>
                      <span className="text-xs text-muted-foreground">Marcar como inativo</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('Bloqueado')} className="gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-sm">
                      <Archive className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Bloquear</span>
                      <span className="text-xs text-muted-foreground">Marcar como bloqueado</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Exportar Selecionados */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">Exportar</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleBulkExportFormat('excel')}>
                    <FileSpreadsheet className="mr-2 h-3 w-3 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExportFormat('pdf')}>
                    <FileText className="mr-2 h-3 w-3 text-red-600" />
                    PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Excluir em Massa */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="h-7 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Excluir</span>
              </Button>

              {/* Limpar Seleção */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 w-7 p-0"
                title="Limpar seleção"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

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
      <div className="overflow-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  const isLastLeftPinned = isPinned === 'left' &&
                    header.column.getIsLastColumn('left');
                  const isFirstRightPinned = isPinned === 'right' &&
                    header.column.getIsFirstColumn('right');

                  return (
                    <TableHead
                      key={header.id}
                      className={`
                        group
                        ${isPinned ? 'sticky bg-muted z-10' : 'relative'}
                        ${isPinned === 'left' ? 'left-0' : ''}
                        ${isPinned === 'right' ? 'right-0' : ''}
                        ${isLastLeftPinned ? 'border-r-2 border-border' : ''}
                        ${isFirstRightPinned ? 'border-l-2 border-border' : ''}
                      `}
                      style={{
                        left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                        right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                    >
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
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    const isLastLeftPinned = isPinned === 'left' &&
                      cell.column.getIsLastColumn('left');
                    const isFirstRightPinned = isPinned === 'right' &&
                      cell.column.getIsFirstColumn('right');

                    return (
                      <TableCell
                        key={cell.id}
                        className={`
                          ${isPinned ? 'sticky bg-background z-10' : 'relative'}
                          ${isPinned === 'left' ? 'left-0' : ''}
                          ${isPinned === 'right' ? 'right-0' : ''}
                          ${isLastLeftPinned ? 'border-r-2 border-border' : ''}
                          ${isFirstRightPinned ? 'border-l-2 border-border' : ''}
                        `}
                        style={{
                          left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                          right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
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

      {/* Dialog de Confirmação de Exclusão em Massa */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold">
                  Confirmar Exclusão em Massa
                </AlertDialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Você está prestes a excluir <strong className="font-semibold text-foreground">{selectionInfo.count}</strong> cliente{selectionInfo.count !== 1 ? 's' : ''} permanentemente.
              <br />
              <br />
              {selectionInfo.isAllMode && (
                <>
                  <span className="text-amber-600 font-medium">⚠️ Atenção:</span> Esta ação afetará todos os clientes filtrados, incluindo aqueles em outras páginas.
                  <br />
                  <br />
                </>
              )}
              Todos os dados associados a {selectionInfo.count === 1 ? 'este cliente' : 'estes clientes'} serão removidos do sistema e não poderão ser recuperados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 sm:flex-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir {selectionInfo.count} Cliente{selectionInfo.count !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exportação */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        data={selectionInfo.isAllMode ? filteredData : selectedClientes}
        availableColumns={exportColumns}
        defaultFilename={`clientes_selecionados_${exportFormat}`}
        title={`Exportar para ${exportFormat.toUpperCase()}`}
        description={`Selecione as colunas que deseja incluir na exportação ${exportFormat === 'excel' ? 'Excel' : 'PDF'} dos clientes selecionados.`}
        onExport={handleExportWithColumns}
        format={exportFormat}
      />
    </div>
  );
}

