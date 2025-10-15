/**
 * Configurações Centralizadas da Aplicação
 */

export const config = {
  // ============================================
  // API
  // ============================================
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',

  // ============================================
  // STORAGE KEYS
  // ============================================
  tokenKey: 'movix_token',
  userKey: 'movix_user',

  // ============================================
  // AUTH
  // ============================================
  // Intervalo para refresh automático do token (6 horas)
  refreshTokenInterval: 6 * 60 * 60 * 1000,
  
  // Buffer antes do token expirar para fazer refresh (5 minutos)
  tokenExpirationBuffer: 5 * 60 * 1000,

  // ============================================
  // APP
  // ============================================
  appName: 'Movix',
  appVersion: '1.0.0',
  appDescription: 'Sistema ERP/PDV - Gestão Empresarial',

  // ============================================
  // TIMEOUTS
  // ============================================
  requestTimeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo

  // ============================================
  // PAGINATION
  // ============================================
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const

// Type helper para garantir type safety
export type Config = typeof config

