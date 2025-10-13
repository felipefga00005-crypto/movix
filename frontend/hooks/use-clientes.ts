'use client';

import { useState, useEffect, useCallback } from 'react';
import { clienteService, Cliente, CreateClienteRequest, UpdateClienteRequest, ClienteStats } from '@/lib/services/cliente.service';
import { toast } from 'sonner';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = async (data: CreateClienteRequest) => {
    try {
      const newCliente = await clienteService.create(data);
      setClientes(prev => [...prev, newCliente]);
      toast.success('Cliente criado com sucesso!');
      return newCliente;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar cliente';
      toast.error(message);
      throw err;
    }
  };

  const updateCliente = async (id: number, data: UpdateClienteRequest) => {
    try {
      const updatedCliente = await clienteService.update(id, data);
      setClientes(prev => prev.map(c => c.id === id ? updatedCliente : c));
      toast.success('Cliente atualizado com sucesso!');
      return updatedCliente;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      toast.error(message);
      throw err;
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      await clienteService.delete(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
      toast.error(message);
      throw err;
    }
  };

  const searchClientes = async (query: string) => {
    setLoading(true);
    try {
      const data = await clienteService.search(query);
      setClientes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar clientes';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes,
  };
}

export function useClienteStats() {
  const [stats, setStats] = useState<ClienteStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clienteService.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

