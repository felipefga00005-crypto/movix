/**
 * API Client
 * Cliente HTTP centralizado para comunicação com o backend
 */

import { getAuthToken, removeAuthToken, removeCurrentUser } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Classe de erro personalizada para erros de API
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Opções para requisições
 */
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Cliente API com interceptors
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Método genérico para fazer requisições
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    // Adiciona o token de autenticação se necessário
    const authHeaders: HeadersInit = {};
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    // Monta a URL completa
    const url = `${this.baseURL}${endpoint}`;

    // Faz a requisição
    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
          ...headers,
        },
      });

      // Trata erros de autenticação
      if (response.status === 401) {
        // Token inválido ou expirado
        removeAuthToken();
        removeCurrentUser();

        // Redireciona para o login apenas no client-side
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        throw new APIError("Não autorizado", 401);
      }

      // Trata outros erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error || errorData.message || "Erro na requisição",
          response.status,
          errorData
        );
      }

      // Retorna os dados
      return await response.json();
    } catch (error) {
      // Re-lança erros de API
      if (error instanceof APIError) {
        throw error;
      }

      // Trata erros de rede
      if (error instanceof TypeError) {
        throw new APIError("Erro de conexão com o servidor", 0);
      }

      // Outros erros
      throw new APIError(
        error instanceof Error ? error.message : "Erro desconhecido",
        0
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(API_URL);

// Exporta também a classe para casos especiais
export default apiClient;

