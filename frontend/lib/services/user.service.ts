import { api } from './api.service'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
  PaginatedResponse,
  UserStatus,
} from '../types'

export const userService = {
  // Create user
  create: (data: CreateUserRequest) =>
    api.post<ApiResponse<User>>('/api/v1/admin/users', data),

  // Get user by ID
  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/api/v1/admin/users/${id}`),

  // List users with pagination
  list: (params?: {
    account_id?: string
    page?: number
    per_page?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.account_id) queryParams.append('account_id', params.account_id)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())

    const query = queryParams.toString()
    return api.get<PaginatedResponse<User>>(
      `/api/v1/admin/users${query ? `?${query}` : ''}`
    )
  },

  // Update user
  update: (id: string, data: UpdateUserRequest) =>
    api.put<ApiResponse<User>>(`/api/v1/admin/users/${id}`, data),

  // Update user status
  updateStatus: (id: string, status: UserStatus) =>
    api.patch<ApiResponse<null>>(
      `/api/v1/admin/users/${id}/status`,
      { status }
    ),

  // Delete user
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/admin/users/${id}`),

  // Link user to company
  linkToCompany: (userId: string, companyId: string) =>
    api.post<ApiResponse<null>>(
      `/api/v1/admin/users/${userId}/companies`,
      { company_id: companyId }
    ),

  // Unlink user from company
  unlinkFromCompany: (userId: string, companyId: string) =>
    api.delete<ApiResponse<null>>(
      `/api/v1/admin/users/${userId}/companies/${companyId}`
    ),
}

export default userService

