import { api } from './api.service'
import type { Certificate, ApiResponse } from '../types'

export const certificateService = {
  // Upload certificate
  upload: (companyId: string, formData: FormData) =>
    api.upload<ApiResponse<Certificate>>(
      `/api/v1/admin/certificates/company/${companyId}`,
      formData
    ),

  // Get active certificate
  getActive: (companyId: string) =>
    api.get<ApiResponse<Certificate>>(
      `/api/v1/admin/certificates/company/${companyId}/active`
    ),

  // Get all company certificates
  getAll: (companyId: string) =>
    api.get<ApiResponse<Certificate[]>>(
      `/api/v1/admin/certificates/company/${companyId}`
    ),

  // Delete certificate
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/v1/admin/certificates/${id}`),
}

export default certificateService

