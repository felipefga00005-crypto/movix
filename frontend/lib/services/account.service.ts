import { api } from './api.service'
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountLimitsRequest,
  ApiResponse,
  PaginatedResponse,
  AccountStatus,
} from '../types'

export const accountService = {
  // Create account
  create: (data: CreateAccountRequest) =>
    api.post<ApiResponse<Account>>('/api/v1/superadmin/accounts', data),

  // Get account by ID
  getById: (id: string) =>
    api.get<ApiResponse<Account>>(`/api/v1/superadmin/accounts/${id}`),

  // List accounts with pagination
  list: (params?: {
    status?: AccountStatus
    page?: number
    per_page?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())

    const query = queryParams.toString()
    return api.get<PaginatedResponse<Account>>(
      `/api/v1/superadmin/accounts${query ? `?${query}` : ''}`
    )
  },

  // Update account limits
  updateLimits: (id: string, data: UpdateAccountLimitsRequest) =>
    api.put<ApiResponse<Account>>(`/api/v1/superadmin/accounts/${id}`, data),

  // Update account status
  updateStatus: (id: string, status: AccountStatus) =>
    api.patch<ApiResponse<null>>(
      `/api/v1/superadmin/accounts/${id}/status`,
      { status }
    ),

  // Delete account
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/superadmin/accounts/${id}`),
}

export default accountService

