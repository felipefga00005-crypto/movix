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
  IconChevronUp,
  IconChevronDown,
  IconPin,
  IconPinFilled,
} from '@tabler/icons-react'
import {
  User,
  CreditCard,
  Mail,
  MapPin,
  ToggleLeft,
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableFilter, useDataTableFilters } from '@/components/data-table-filter'
import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters'
import { clienteService } from '@/lib/services/cliente.service'
import type { Cliente } from '@/types/cliente'
import { useAuth } from '@/hooks/useAuth'
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
  const { logoutOnTokenExpired } = useAuth()

  // Criar o helper de configuração de colunas
  const dtf = useMemo(() => createColumnConfigHelper<Cliente>(), [])

  // Configuração das colunas usando o padrão correto
  const columnsConfig = useMemo(() => [
    dtf.text()
      .id('razao_social')
      .accessor((cliente) => cliente.razao_social)
      .displayName('Nome/Razão Social')
      .icon(User)
      .build(),

    dtf.option()
      .id('tipo_pessoa')
      .accessor((cliente) => cliente.tipo_pessoa)
      .displayName('Tipo Pessoa')
      .icon(User)
      .options([
        { label: 'Pessoa Física', value: 'PF' },
        { label: 'Pessoa Jurídica', value: 'PJ' },
      ])
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
      .id('municipio')
      .accessor((cliente) => cliente.municipio || '')
      .displayName('Cidade')
      .icon(MapPin)
      .build(),

    dtf.option()
      .id('uf')
      .accessor((cliente) => cliente.uf || '')
      .displayName('UF')
      .icon(MapPin)
      .options([
        { label: 'SP', value: 'SP' },
        { label: 'RJ', value: 'RJ' },
        { label: 'MG', value: 'MG' },
        { label: 'RS', value: 'RS' },
        { label: 'PR', value: 'PR' },
        { label: 'SC', value: 'SC' },
        { label: 'BA', value: 'BA' },
        { label: 'GO', value: 'GO' },
        { label: 'ES', value: 'ES' },
        { label: 'DF', value: 'DF' },
      ])
      .build(),
  ], [dtf])

  // Hook do DataTableFilter
  const { columns, filters, actions } = useDataTableFilters({
    strategy: 'client',
    data: clientes,
    columnsConfig,
  })

  // Aplicar filtros manualmente para exibição
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
            if (filter.operator === 'is') {
              return String(value).toLowerCase() === String(filter.values[0]).toLowerCase()
            }
            if (filter.operator === 'is not') {
              return String(value).toLowerCase() !== String(filter.values[0]).toLowerCase()
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
      console.error('Erro ao carregar clientes:', error)

      // Se for erro de autenticação, faz logout automático
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      } else {
        toast.error(error.message || 'Erro ao carregar clientes')
      }
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
    <div className="space-y-3">
      {/* Header com filtros e ações */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* Filtros */}
        <div className="flex-1 lg:max-w-md">
          <DataTableFilter
            columns={columns}
            filters={filters}
            actions={actions}
            strategy="client"
            locale="en"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 lg:ml-4">
          <Button variant="outline" className="h-7" onClick={loadClientes} disabled={isLoading}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" className="h-7">
            <IconDownload className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" className="h-7" onClick={onNew}>
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Tabela */}
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
    </div>
  )
}
