'use client'

/**
 * Tabela de Clientes com Filtros Avançados
 * Usa o DataTableFilter para filtros dinâmicos
 */

import { useState, useEffect, useMemo } from 'react'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconRefresh,
  IconDownload,
  IconUser,
  IconId,
  IconMail,
  IconPhone,
  IconMapPin,
  IconToggleLeft,
} from '@tabler/icons-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTableFilter, useDataTableFilters } from '@/components/data-table-filter'
import { clienteService } from '@/lib/services/cliente.service'
import type { Cliente } from '@/types/cliente'
import { toast } from 'sonner'

interface ClientesDataTableProps {
  onEdit?: (cliente: Cliente) => void
  onView?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onNew?: () => void
}

export function ClientesDataTable({
  onEdit,
  onView,
  onDelete,
  onNew,
}: ClientesDataTableProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Configuração das colunas para o filtro
  const columnsConfig = useMemo(() => [
    {
      id: 'razao_social',
      accessor: (cliente: Cliente) => cliente.razao_social,
      displayName: 'Nome/Razão Social',
      icon: IconUser,
      type: 'text' as const,
    },
    {
      id: 'tipo_pessoa',
      accessor: (cliente: Cliente) => cliente.tipo_pessoa,
      displayName: 'Tipo Pessoa',
      icon: IconUser,
      type: 'option' as const,
      options: [
        { label: 'Pessoa Física', value: 'PF' },
        { label: 'Pessoa Jurídica', value: 'PJ' },
      ],
    },
    {
      id: 'status',
      accessor: (cliente: Cliente) => cliente.status,
      displayName: 'Status',
      icon: IconToggleLeft,
      type: 'option' as const,
      options: [
        { label: 'Ativo', value: 'Ativo' },
        { label: 'Inativo', value: 'Inativo' },
      ],
    },
    {
      id: 'cnpj_cpf',
      accessor: (cliente: Cliente) => cliente.cnpj_cpf,
      displayName: 'CPF/CNPJ',
      icon: IconId,
      type: 'text' as const,
    },
    {
      id: 'email',
      accessor: (cliente: Cliente) => cliente.email || '',
      displayName: 'Email',
      icon: IconMail,
      type: 'text' as const,
    },
    {
      id: 'municipio',
      accessor: (cliente: Cliente) => cliente.municipio || '',
      displayName: 'Cidade',
      icon: IconMapPin,
      type: 'text' as const,
    },
    {
      id: 'uf',
      accessor: (cliente: Cliente) => cliente.uf || '',
      displayName: 'UF',
      icon: IconMapPin,
      type: 'option' as const,
      options: [
        { label: 'SP', value: 'SP' },
        { label: 'RJ', value: 'RJ' },
        { label: 'MG', value: 'MG' },
        { label: 'RS', value: 'RS' },
        { label: 'PR', value: 'PR' },
        { label: 'SC', value: 'SC' },
        // Adicionar outros estados conforme necessário
      ],
    },
  ], [])

  // Hook do DataTableFilter
  const { columns, filters, actions } = useDataTableFilters({
    strategy: 'client',
    data: clientes,
    columnsConfig,
  })

  // Filtra os dados manualmente baseado nos filtros ativos
  const filteredData = useMemo(() => {
    if (filters.length === 0) return clientes

    return clientes.filter((cliente) => {
      return filters.every((filter) => {
        const column = columnsConfig.find(col => col.id === filter.columnId)
        if (!column) return true

        const value = column.accessor(cliente)

        switch (filter.type) {
          case 'text':
            if (filter.operator === 'contains') {
              return String(value).toLowerCase().includes(String(filter.values[0]).toLowerCase())
            }
            if (filter.operator === 'does not contain') {
              return !String(value).toLowerCase().includes(String(filter.values[0]).toLowerCase())
            }
            break
          case 'option':
            if (filter.operator === 'is') {
              return filter.values.includes(String(value))
            }
            if (filter.operator === 'is not') {
              return !filter.values.includes(String(value))
            }
            break
        }
        return true
      })
    })
  }, [clientes, filters, columnsConfig])

  // Carrega clientes ao montar o componente
  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const data = await clienteService.getAll()
      setClientes(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${cliente.razao_social}"?`)) {
      return
    }

    try {
      await clienteService.delete(cliente.id)
      toast.success('Cliente excluído com sucesso!')
      loadClientes()
      onDelete?.(cliente)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default'
      case 'Inativo':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTipoPessoaLabel = (tipo: string) => {
    return tipo === 'PF' ? 'PF' : 'PJ'
  }

  const formatCpfCnpj = (cpfCnpj: string) => {
    if (!cpfCnpj) return ''
    
    // Remove caracteres não numéricos
    const numbers = cpfCnpj.replace(/\D/g, '')
    
    if (numbers.length === 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    
    return cpfCnpj
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            {filteredData.length} de {clientes.length} cliente(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadClientes} disabled={isLoading}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline">
            <IconDownload className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={onNew}>
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros para encontrar clientes específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableFilter
            columns={columns}
            filters={filters}
            actions={actions}
            strategy="client"
            locale="en"
          />
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie o cadastro de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome/Razão Social</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getTipoPessoaLabel(cliente.tipo_pessoa)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {cliente.razao_social}
                        {cliente.nome_fantasia && (
                          <div className="text-sm text-muted-foreground">
                            {cliente.nome_fantasia}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatCpfCnpj(cliente.cnpj_cpf)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cliente.email || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cliente.fone || cliente.celular || '-'}
                      </TableCell>
                      <TableCell>
                        {cliente.municipio && cliente.uf 
                          ? `${cliente.municipio}/${cliente.uf}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(cliente.status)}>
                          {cliente.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView?.(cliente)}
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(cliente)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cliente)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
