import { useState, useEffect, useCallback } from 'react'
import { clienteService } from '@/lib/services/cliente.service'
import { useAuth } from '@/hooks/useAuth'
import type { Cliente } from '@/types/cliente'
import { toast } from 'sonner'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { logoutOnTokenExpired } = useAuth()

  const loadClientes = useCallback(async () => {
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
      }

      toast.error('Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }, [logoutOnTokenExpired])

  const deleteCliente = useCallback(async (id: number) => {
    try {
      await clienteService.delete(id)
      setClientes(prev => prev.filter(cliente => cliente.id !== id))
      toast.success('Cliente excluído com sucesso')
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error)
      
      if (error.status === 401) {
        logoutOnTokenExpired()
        return
      }

      toast.error('Erro ao excluir cliente')
    }
  }, [logoutOnTokenExpired])

  const refreshClientes = useCallback(() => {
    loadClientes()
  }, [loadClientes])

  useEffect(() => {
    loadClientes()
  }, [loadClientes])

  return {
    clientes,
    isLoading,
    loadClientes,
    deleteCliente,
    refreshClientes,
  }
}
