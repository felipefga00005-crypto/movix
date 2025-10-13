// ============================================
// API CLIENT - Cliente HTTP para Backend Go
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const API_VERSION = "/api/v1"

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl + API_VERSION
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Construir URL completa
    const fullUrl = `${this.baseUrl}${endpoint}`
    const url = new URL(fullUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options

    const url = this.buildUrl(endpoint, params)

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Se não houver conteúdo (204 No Content)
      if (response.status === 204) {
        return {} as T
      }

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error || data.message || "Erro na requisição",
          data
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Erro de rede ou parsing
      throw new ApiError(
        0,
        error instanceof Error ? error.message : "Erro desconhecido",
        error
      )
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log('apiClient.put - Endpoint:', endpoint)
    console.log('apiClient.put - Data:', data)

    try {
      const result = await this.request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      console.log('apiClient.put - Success:', result)
      return result
    } catch (error) {
      console.error('apiClient.put - Error:', error)
      throw error
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient()

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  return apiClient.get("/health")
}

