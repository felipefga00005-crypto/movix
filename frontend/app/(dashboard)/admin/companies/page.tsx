'use client'

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { IconPlus, IconPencil, IconTrash, IconLock, IconLockOpen } from '@tabler/icons-react'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { companyService } from '@/lib/services/company.service'
import type { Company } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
}

const statusLabels = {
  active: 'Ativa',
  inactive: 'Inativa',
}

export default function CompaniesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.account_id) {
      loadCompanies()
    }
  }, [user])

  const loadCompanies = async () => {
    if (!user?.account_id) return

    try {
      setLoading(true)
      const response = await companyService.list({ account_id: user.account_id })
      setCompanies(response.data)
    } catch (error) {
      toast.error('Erro ao carregar empresas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await companyService.updateStatus(id, status)
      toast.success('Status atualizado com sucesso')
      loadCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return

    try {
      await companyService.delete(id)
      toast.success('Empresa excluída com sucesso')
      loadCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir empresa')
    }
  }

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'trade_name',
      header: 'Nome Fantasia',
    },
    {
      accessorKey: 'legal_name',
      header: 'Razão Social',
    },
    {
      accessorKey: 'document',
      header: 'CNPJ',
      cell: ({ row }) => {
        const doc = row.original.document
        return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      },
    },
    {
      accessorKey: 'tax_regime',
      header: 'Regime Tributário',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/companies/${row.original.id}`)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {row.original.status === 'active' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'inactive')}>
                <IconLock className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            )}
            {row.original.status === 'inactive' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'active')}>
                <IconLockOpen className="mr-2 h-4 w-4" />
                Ativar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas da sua conta</p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/companies/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>Visualize e gerencie todas as empresas da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={companies} searchKey="trade_name" searchPlaceholder="Buscar por nome..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

