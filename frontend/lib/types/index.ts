// Common types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// Account types
export type AccountStatus = 'active' | 'suspended' | 'cancelled'

export interface Account {
  id: string
  name: string
  document: string
  email: string
  phone?: string
  status: AccountStatus
  max_companies: number
  max_users: number
  max_nfes_per_month: number
  created_at: string
  updated_at: string
}

export interface CreateAccountRequest {
  name: string
  document: string
  email: string
  phone?: string
  max_companies: number
  max_users: number
  max_nfes_per_month: number
  admin_name: string
  admin_email: string
  admin_password: string
}

export interface UpdateAccountLimitsRequest {
  max_companies?: number
  max_users?: number
  max_nfes_per_month?: number
}

// Company types
export type CompanyStatus = 'active' | 'inactive'

export interface Company {
  id: string
  account_id: string
  trade_name: string
  legal_name: string
  document: string
  state_registration?: string
  municipal_registration?: string
  tax_regime: string
  email?: string
  phone?: string
  address?: Address
  status: CompanyStatus
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface CreateCompanyRequest {
  account_id: string
  trade_name: string
  legal_name: string
  document: string
  state_registration?: string
  municipal_registration?: string
  tax_regime: string
  email?: string
  phone?: string
  address?: Address
}

export interface UpdateCompanyRequest {
  trade_name?: string
  legal_name?: string
  state_registration?: string
  municipal_registration?: string
  tax_regime?: string
  email?: string
  phone?: string
  address?: Address
}

// User types
export type UserRole = 'superadmin' | 'admin' | 'user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  account_id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  account_id: string
  email: string
  name: string
  password: string
  phone?: string
  role: UserRole
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  phone?: string
  role?: UserRole
}

// Certificate types
export interface Certificate {
  id: string
  company_id: string
  name: string
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// NFe types
export type NFeStatus = 'draft' | 'authorized' | 'rejected' | 'cancelled'
export type NFeType = 'entrada' | 'saida'
export type NFePurpose = 'normal' | 'complementar' | 'ajuste' | 'devolucao'

export interface NFe {
  id: string
  company_id: string
  number: number
  series: number
  type: NFeType
  purpose: NFePurpose
  status: NFeStatus
  issue_date: string
  customer?: Customer
  items: NFeItem[]
  totals: NFeTotals
  transport?: NFeTransport
  additional_info?: string
  access_key?: string
  protocol?: string
  authorization_date?: string
  xml_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface NFeItem {
  id?: string
  product_id: string
  product_code: string
  product_name: string
  ncm: string
  cfop: string
  unit: string
  quantity: number
  unit_price: number
  total_price: number
  discount?: number
  freight?: number
  insurance?: number
  other_costs?: number
  icms?: TaxICMS
  ipi?: TaxIPI
  pis?: TaxPIS
  cofins?: TaxCOFINS
}

export interface TaxICMS {
  cst: string
  base_calc: number
  rate: number
  value: number
}

export interface TaxIPI {
  cst: string
  base_calc: number
  rate: number
  value: number
}

export interface TaxPIS {
  cst: string
  base_calc: number
  rate: number
  value: number
}

export interface TaxCOFINS {
  cst: string
  base_calc: number
  rate: number
  value: number
}

export interface NFeTotals {
  products_total: number
  discount_total: number
  freight_total: number
  insurance_total: number
  other_costs_total: number
  icms_base_calc: number
  icms_total: number
  ipi_total: number
  pis_total: number
  cofins_total: number
  nfe_total: number
}

export interface NFeTransport {
  modality: string
  carrier_id?: string
  carrier_name?: string
  carrier_document?: string
  vehicle_plate?: string
  vehicle_state?: string
  freight_value?: number
}

export interface CreateNFeRequest {
  company_id: string
  type: NFeType
  purpose: NFePurpose
  customer_id: string
  items: NFeItem[]
  transport?: NFeTransport
  additional_info?: string
}

// Customer types
export interface Customer {
  id: string
  company_id: string
  name: string
  document: string
  email?: string
  phone?: string
  address?: Address
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCustomerRequest {
  name: string
  document: string
  email?: string
  phone?: string
  address?: Address
}

export interface UpdateCustomerRequest {
  name?: string
  document?: string
  email?: string
  phone?: string
  address?: Address
  is_active?: boolean
}

// Product types
export interface Product {
  id: string
  company_id: string
  code: string
  name: string
  description?: string
  ncm: string
  unit: string
  price: number
  cost?: number
  stock_quantity?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  code: string
  name: string
  description?: string
  ncm: string
  unit: string
  price: number
  cost?: number
  stock_quantity?: number
}

export interface UpdateProductRequest {
  code?: string
  name?: string
  description?: string
  ncm?: string
  unit?: string
  price?: number
  cost?: number
  stock_quantity?: number
  is_active?: boolean
}

// Carrier types
export interface Carrier {
  id: string
  company_id: string
  name: string
  document: string
  state_registration?: string
  email?: string
  phone?: string
  address?: Address
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCarrierRequest {
  name: string
  document: string
  state_registration?: string
  email?: string
  phone?: string
  address?: Address
}

export interface UpdateCarrierRequest {
  name?: string
  document?: string
  state_registration?: string
  email?: string
  phone?: string
  address?: Address
  is_active?: boolean
}

