import { api } from './api.service'
import type {
  Carrier,
  CreateCarrierRequest,
  UpdateCarrierRequest,
  ApiResponse,
} from '../types'

export const carrierService = {
  // Create carrier
  create: (data: CreateCarrierRequest) =>
    api.post<ApiResponse<Carrier>>('/api/v1/transportadoras', data),

  // Get carrier by ID
  getById: (id: string) =>
    api.get<ApiResponse<Carrier>>(`/api/v1/transportadoras/${id}`),

  // List carriers
  list: (activeOnly: boolean = true) =>
    api.get<ApiResponse<Carrier[]>>(
      `/api/v1/transportadoras?active=${activeOnly}`
    ),

  // Search carriers
  search: (query: string) =>
    api.get<ApiResponse<Carrier[]>>(
      `/api/v1/transportadoras/search?q=${encodeURIComponent(query)}`
    ),

  // Update carrier
  update: (id: string, data: UpdateCarrierRequest) =>
    api.put<ApiResponse<Carrier>>(`/api/v1/transportadoras/${id}`, data),

  // Delete carrier
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/transportadoras/${id}`),
}

export default carrierService

