import { api } from './api.service'
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  ApiResponse,
  PaginatedResponse,
  CompanyStatus,
} from '../types'

export const companyService = {
  // Create company
  create: (data: CreateCompanyRequest) =>
    api.post<ApiResponse<Company>>('/api/v1/admin/companies', data),

  // Get company by ID
  getById: (id: string) =>
    api.get<ApiResponse<Company>>(`/api/v1/admin/companies/${id}`),

  // List companies with pagination
  list: (params: {
    account_id: string
    status?: CompanyStatus
    page?: number
    per_page?: number
  }) => {
    const queryParams = new URLSearchParams()
    queryParams.append('account_id', params.account_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())

    return api.get<PaginatedResponse<Company>>(
      `/api/v1/admin/companies?${queryParams.toString()}`
    )
  },

  // Update company
  update: (id: string, data: UpdateCompanyRequest) =>
    api.put<ApiResponse<Company>>(`/api/v1/admin/companies/${id}`, data),

  // Update company status
  updateStatus: (id: string, status: CompanyStatus) =>
    api.patch<ApiResponse<null>>(
      `/api/v1/admin/companies/${id}/status`,
      { status }
    ),

  // Delete company
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/admin/companies/${id}`),
}

export default companyService

