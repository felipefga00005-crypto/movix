'use client';

import { useState, useEffect, useCallback } from 'react';
import { fornecedorService, Fornecedor, CreateFornecedorRequest, UpdateFornecedorRequest, FornecedorStats } from '@/lib/services/fornecedor.service';
import { toast } from 'sonner';

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fornecedorService.getAll();
      setFornecedores(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar fornecedores';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const createFornecedor = async (data: CreateFornecedorRequest) => {
    try {
      const newFornecedor = await fornecedorService.create(data);
      setFornecedores(prev => [...prev, newFornecedor]);
      toast.success('Fornecedor criado com sucesso!');
      return newFornecedor;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar fornecedor';
      toast.error(message);
      throw err;
    }
  };

  const updateFornecedor = async (id: number, data: UpdateFornecedorRequest) => {
    try {
      const updatedFornecedor = await fornecedorService.update(id, data);
      setFornecedores(prev => prev.map(f => f.id === id ? updatedFornecedor : f));
      toast.success('Fornecedor atualizado com sucesso!');
      return updatedFornecedor;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar fornecedor';
      toast.error(message);
      throw err;
    }
  };

  const deleteFornecedor = async (id: number) => {
    try {
      await fornecedorService.delete(id);
      setFornecedores(prev => prev.filter(f => f.id !== id));
      toast.success('Fornecedor excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir fornecedor';
      toast.error(message);
      throw err;
    }
  };

  const searchFornecedores = async (query: string) => {
    setLoading(true);
    try {
      const data = await fornecedorService.search(query);
      setFornecedores(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar fornecedores';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    fornecedores,
    loading,
    error,
    fetchFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    searchFornecedores,
  };
}

export function useFornecedorStats() {
  const [stats, setStats] = useState<FornecedorStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fornecedorService.getStats();
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

