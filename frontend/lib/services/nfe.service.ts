import { api } from './api.service'
import type {
  NFe,
  CreateNFeRequest,
  ApiResponse,
  PaginatedResponse,
  NFeStatus,
} from '../types'

export const nfeService = {
  // Create NFe draft
  create: (data: CreateNFeRequest) =>
    api.post<ApiResponse<NFe>>('/api/v1/nfes', data),

  // Get NFe by ID
  getById: (id: string) =>
    api.get<ApiResponse<NFe>>(`/api/v1/nfes/${id}`),

  // List NFes with pagination
  list: (params?: {
    company_id?: string
    status?: NFeStatus
    page?: number
    per_page?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.company_id) queryParams.append('company_id', params.company_id)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())

    const query = queryParams.toString()
    return api.get<PaginatedResponse<NFe>>(
      `/api/v1/nfes${query ? `?${query}` : ''}`
    )
  },

  // Authorize NFe
  authorize: (id: string) =>
    api.post<ApiResponse<NFe>>(`/api/v1/nfes/${id}/authorize`),

  // Cancel NFe
  cancel: (id: string, justificativa: string) =>
    api.post<ApiResponse<NFe>>(`/api/v1/nfes/${id}/cancel`, { justificativa }),

  // Download XML
  downloadXML: async (id: string) => {
    const response = await api.get<any>(`/api/v1/nfes/${id}/xml`)
    
    // If response is a Response object (from fetchWithAuth)
    if (response instanceof Response) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nfe_${id}.xml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  },
}

export default nfeService

