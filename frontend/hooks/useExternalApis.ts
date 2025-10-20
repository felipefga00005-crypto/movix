import { useState, useCallback } from 'react';
import { ExternalApiService, type CnpjData, type CepData } from '@/lib/services/external-api.service';

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

  // Hook para consulta de CNPJ
  const autoFillByCnpj = useCallback(async (cnpj: string): Promise<CnpjData | null> => {
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
      setError(err instanceof Error ? err.message : 'Erro na consulta do CNPJ');
      return null;
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
    clearError: () => setError(null),
  };
};
