import { fetchWithAuth } from './auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetchWithAuth(url, options)

    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
      return response as any
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Request failed',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    )
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),

  upload: async <T>(endpoint: string, formData: FormData) => {
    const url = `${API_URL}${endpoint}`
    const token = (await import('./auth.service')).getToken()

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Upload failed',
        response.status,
        data
      )
    }

    return data as T
  },
}

export default api

