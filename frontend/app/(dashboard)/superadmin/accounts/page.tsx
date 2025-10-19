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
import { accountService } from '@/lib/services/account.service'
import type { Account } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const statusColors = {
  active: 'bg-green-500',
  suspended: 'bg-yellow-500',
  cancelled: 'bg-red-500',
}

const statusLabels = {
  active: 'Ativa',
  suspended: 'Suspensa',
  cancelled: 'Cancelada',
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const response = await accountService.list()
      setAccounts(response.data)
    } catch (error) {
      toast.error('Erro ao carregar contas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'active' | 'suspended' | 'cancelled') => {
    try {
      await accountService.updateStatus(id, status)
      toast.success('Status atualizado com sucesso')
      loadAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      await accountService.delete(id)
      toast.success('Conta excluída com sucesso')
      loadAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir conta')
    }
  }

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
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
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'max_companies',
      header: 'Empresas',
      cell: ({ row }) => `${row.original.max_companies}`,
    },
    {
      accessorKey: 'max_users',
      header: 'Usuários',
      cell: ({ row }) => `${row.original.max_users}`,
    },
    {
      accessorKey: 'max_nfes_per_month',
      header: 'NFes/Mês',
      cell: ({ row }) => `${row.original.max_nfes_per_month}`,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/superadmin/accounts/${row.original.id}`)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {row.original.status === 'active' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus(row.original.id, 'suspended')}>
                <IconLock className="mr-2 h-4 w-4" />
                Suspender
              </DropdownMenuItem>
            )}
            {row.original.status === 'suspended' && (
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
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">Gerencie as contas do sistema</p>
        </div>
        <Button onClick={() => router.push('/dashboard/superadmin/accounts/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas</CardTitle>
          <CardDescription>Visualize e gerencie todas as contas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={accounts} searchKey="name" searchPlaceholder="Buscar por nome..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

