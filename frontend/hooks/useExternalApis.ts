import { useState, useCallback } from 'react';
import { ExternalApiService, type CnpjData, type CepData, type AutoFillData } from '@/lib/services/external-api.service';

export const useExternalApis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook para consulta de CNPJ
  const consultarCnpj = useCallback(async (cnpj: string): Promise<CnpjData | null> => {
    if (!cnpj || !ExternalApiService.validateCnpj(cnpj)) {
      setError('CNPJ inválido');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ExternalApiService.consultarCnpj(cnpj);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar CNPJ');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook para consulta de CEP
  const consultarCep = useCallback(async (cep: string): Promise<CepData | null> => {
    if (!cep || !ExternalApiService.validateCep(cep)) {
      setError('CEP inválido');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ExternalApiService.consultarCep(cep);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook para auto-preenchimento por CNPJ
  const autoFillByCnpj = useCallback(async (cnpj: string): Promise<AutoFillData | null> => {
    if (!cnpj || !ExternalApiService.validateCnpj(cnpj)) {
      setError('CNPJ inválido');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ExternalApiService.autoFillByCnpj(cnpj);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no auto-preenchimento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook para auto-preenchimento por CEP
  const autoFillByCep = useCallback(async (cep: string): Promise<AutoFillData | null> => {
    if (!cep || !ExternalApiService.validateCep(cep)) {
      setError('CEP inválido');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ExternalApiService.autoFillByCep(cep);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no auto-preenchimento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para validação cruzada
  const validarDadosCruzados = useCallback(async (dados: {
    cnpj?: string;
    cep?: string;
    uf?: string;
    municipio?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ExternalApiService.validarDadosCruzados(dados);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na validação');
      return { success: false, data: { valid: false, errors: [err instanceof Error ? err.message : 'Erro desconhecido'], warnings: [] } };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    consultarCnpj,
    consultarCep,
    autoFillByCnpj,
    autoFillByCep,
    validarDadosCruzados,
    clearError: () => setError(null),
  };
};
