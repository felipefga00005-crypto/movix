'use client'

/**
 * Dashboard Service
 * Serviço para dados do dashboard
 */

import { httpClient } from '@/lib/http-client'

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  newCustomers: number
  customersChange: number
  activeAccounts: number
  accountsChange: number
  growthRate: number
  growthChange: number
}

export interface ChartData {
  date: string
  desktop: number
  mobile: number
}

export interface TableData {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

// ============================================
// SERVICE
// ============================================

export const dashboardService = {
  /**
   * Obtém estatísticas do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      return await httpClient.get<DashboardStats>('/dashboard/stats')
    } catch (error) {
      // Fallback para dados estáticos em caso de erro
      return {
        totalRevenue: 1250.00,
        revenueChange: 12.5,
        newCustomers: 1234,
        customersChange: -20,
        activeAccounts: 45678,
        accountsChange: 12.5,
        growthRate: 4.5,
        growthChange: 4.5,
      }
    }
  },

  /**
   * Obtém dados do gráfico
   */
  async getChartData(): Promise<ChartData[]> {
    try {
      return await httpClient.get<ChartData[]>('/dashboard/chart')
    } catch (error) {
      // Fallback para dados estáticos em caso de erro
      return [
        { date: "2024-01-01", desktop: 222, mobile: 150 },
        { date: "2024-01-02", desktop: 97, mobile: 180 },
        { date: "2024-01-03", desktop: 167, mobile: 120 },
        { date: "2024-01-04", desktop: 242, mobile: 260 },
        { date: "2024-01-05", desktop: 373, mobile: 290 },
        { date: "2024-01-06", desktop: 301, mobile: 340 },
        { date: "2024-01-07", desktop: 245, mobile: 180 },
        { date: "2024-01-08", desktop: 409, mobile: 320 },
        { date: "2024-01-09", desktop: 59, mobile: 110 },
        { date: "2024-01-10", desktop: 261, mobile: 190 },
        { date: "2024-01-11", desktop: 327, mobile: 350 },
        { date: "2024-01-12", desktop: 292, mobile: 210 },
        { date: "2024-01-13", desktop: 342, mobile: 380 },
        { date: "2024-01-14", desktop: 137, mobile: 220 },
        { date: "2024-01-15", desktop: 120, mobile: 170 },
        { date: "2024-01-16", desktop: 138, mobile: 190 },
        { date: "2024-01-17", desktop: 446, mobile: 360 },
        { date: "2024-01-18", desktop: 364, mobile: 410 },
        { date: "2024-01-19", desktop: 243, mobile: 180 },
        { date: "2024-01-20", desktop: 89, mobile: 150 },
        { date: "2024-01-21", desktop: 137, mobile: 200 },
        { date: "2024-01-22", desktop: 224, mobile: 170 },
        { date: "2024-01-23", desktop: 138, mobile: 230 },
        { date: "2024-01-24", desktop: 387, mobile: 290 },
        { date: "2024-01-25", desktop: 215, mobile: 250 },
        { date: "2024-01-26", desktop: 75, mobile: 130 },
        { date: "2024-01-27", desktop: 383, mobile: 420 },
        { date: "2024-01-28", desktop: 122, mobile: 180 },
        { date: "2024-01-29", desktop: 315, mobile: 240 },
        { date: "2024-01-30", desktop: 454, mobile: 380 },
        { date: "2024-01-31", desktop: 165, mobile: 220 },
      ]
    }
  },

  /**
   * Obtém dados da tabela
   */
  async getTableData(): Promise<TableData[]> {
    try {
      return await httpClient.get<TableData[]>('/dashboard/table')
    } catch (error) {
      // Fallback para dados estáticos em caso de erro
      // Importa dados do arquivo JSON como fallback
      return import('../../app/(dashboard)/dashboard/data.json').then(module => module.default)
    }
  },
}
