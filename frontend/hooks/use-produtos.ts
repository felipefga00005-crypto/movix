'use client';

import { useState, useEffect, useCallback } from 'react';
import { produtoService, Produto, CreateProdutoRequest, UpdateProdutoRequest, ProdutoStats } from '@/lib/services/produto.service';
import { toast } from 'sonner';

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await produtoService.getAll();
      setProdutos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const createProduto = async (data: CreateProdutoRequest) => {
    try {
      const newProduto = await produtoService.create(data);
      setProdutos(prev => [...prev, newProduto]);
      toast.success('Produto criado com sucesso!');
      return newProduto;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar produto';
      toast.error(message);
      throw err;
    }
  };

  const updateProduto = async (id: number, data: UpdateProdutoRequest) => {
    try {
      const updatedProduto = await produtoService.update(id, data);
      setProdutos(prev => prev.map(p => p.id === id ? updatedProduto : p));
      toast.success('Produto atualizado com sucesso!');
      return updatedProduto;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      toast.error(message);
      throw err;
    }
  };

  const deleteProduto = async (id: number) => {
    try {
      await produtoService.delete(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir produto';
      toast.error(message);
      throw err;
    }
  };

  const searchProdutos = async (query: string) => {
    setLoading(true);
    try {
      const data = await produtoService.search(query);
      setProdutos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar produtos';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    produtos,
    loading,
    error,
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
    searchProdutos,
  };
}

export function useProdutoStats() {
  const [stats, setStats] = useState<ProdutoStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await produtoService.getStats();
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

