/**
 * HTTP Client - Cliente HTTP centralizado
 * Com interceptor de token, error handling e retry logic
 */

import { config } from './config'
import { tokenStorage } from './storage'

// ============================================
// TYPES
// ============================================

interface RequestConfig extends RequestInit {
  retry?: boolean
  retryAttempts?: number
  retryDelay?: number
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

// ============================================
// HTTP CLIENT CLASS
// ============================================

class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Adiciona headers padrão incluindo token de autenticação
   */
  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders)

    // Adiciona Content-Type se não foi especificado
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    // Adiciona token de autenticação se existir
    const token = tokenStorage.get()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  /**
   * Faz a requisição HTTP com retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const {
      retry = true,
      retryAttempts = config.retryAttempts,
      retryDelay = config.retryDelay,
      ...fetchOptions
    } = options

    const url = `${this.baseURL}${endpoint}`
    const headers = this.getHeaders(fetchOptions.headers)

    let lastError: Error | null = null
    const attempts = retry ? retryAttempts : 1

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          config.requestTimeout
        )

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Se a resposta não for ok, lança erro
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new HttpError(
            errorData.error || errorData.message || `HTTP Error ${response.status}`,
            response.status,
            errorData
          )
        }

        // Verifica se há conteúdo na resposta
        const contentLength = response.headers.get('content-length')
        if (contentLength === '0' || response.status === 204) {
          return {} as T
        }

        // Retorna JSON se houver conteúdo
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          if (!text || text.trim() === '') {
            return {} as T
          }
          return JSON.parse(text) as T
        }

        // Retorna vazio para respostas sem conteúdo
        return {} as T
      } catch (error) {
        lastError = error as Error

        // Se for o último attempt ou erro não for de rede, lança o erro
        if (
          attempt === attempts - 1 ||
          error instanceof HttpError ||
          (error as Error).name === 'AbortError'
        ) {
          throw error
        }

        // Aguarda antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const httpClient = new HttpClient(config.apiUrl)

// Export da classe para testes
export { HttpClient }

