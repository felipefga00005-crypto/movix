import { api } from './api.service'
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
} from '../types'

export const productService = {
  // Create product
  create: (data: CreateProductRequest) =>
    api.post<ApiResponse<Product>>('/api/v1/produtos', data),

  // Get product by ID
  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/api/v1/produtos/${id}`),

  // List products
  list: (activeOnly: boolean = true) =>
    api.get<ApiResponse<Product[]>>(
      `/api/v1/produtos?active=${activeOnly}`
    ),

  // Search products
  search: (query: string) =>
    api.get<ApiResponse<Product[]>>(
      `/api/v1/produtos/search?q=${encodeURIComponent(query)}`
    ),

  // Update product
  update: (id: string, data: UpdateProductRequest) =>
    api.put<ApiResponse<Product>>(`/api/v1/produtos/${id}`, data),

  // Delete product
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/produtos/${id}`),
}

export default productService

