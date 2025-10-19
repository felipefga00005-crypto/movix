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
import { userService } from '@/lib/services/user.service'
import type { User } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-yellow-500',
}

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
}

const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  user: 'Usuário',
}

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser?.account_id) {
      loadUsers()
    }
  }, [currentUser])

  const loadUsers = async () => {
    if (!currentUser?.account_id) return

    try {
      setLoading(true)
      const response = await userService.list({ account_id: currentUser.account_id })
      setUsers(response.data)
    } catch (error) {
      toast.error('Erro ao carregar usuários')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await userService.updateStatus(id, status)
      toast.success('Status atualizado com sucesso')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await userService.delete(id)
      toast.success('Usuário excluído com sucesso')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário')
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'role',
      header: 'Perfil',
      cell: ({ row }) => (
        <Badge variant="outline">
          {roleLabels[row.original.role]}
        </Badge>
      ),
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/users/${row.original.id}`)}>
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
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da sua conta</p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/users/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Buscar por nome..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

