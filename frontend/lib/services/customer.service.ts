import { api } from './api.service'
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ApiResponse,
} from '../types'

export const customerService = {
  // Create customer
  create: (data: CreateCustomerRequest) =>
    api.post<ApiResponse<Customer>>('/api/v1/clientes', data),

  // Get customer by ID
  getById: (id: string) =>
    api.get<ApiResponse<Customer>>(`/api/v1/clientes/${id}`),

  // List customers
  list: (activeOnly: boolean = true) =>
    api.get<ApiResponse<Customer[]>>(
      `/api/v1/clientes?active=${activeOnly}`
    ),

  // Search customers
  search: (query: string) =>
    api.get<ApiResponse<Customer[]>>(
      `/api/v1/clientes/search?q=${encodeURIComponent(query)}`
    ),

  // Update customer
  update: (id: string, data: UpdateCustomerRequest) =>
    api.put<ApiResponse<Customer>>(`/api/v1/clientes/${id}`, data),

  // Delete customer
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/clientes/${id}`),
}

export default customerService

