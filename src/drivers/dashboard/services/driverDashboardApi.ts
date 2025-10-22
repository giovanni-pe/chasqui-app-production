// src/drivers/dashboard/services/driverDashboardApi.ts
import { api } from '@/lib/api'
import type { DriverDashboardStats } from '../types'

export const driverDashboardApi = {
  async getStats(): Promise<DriverDashboardStats> {
    const res = await api.get< DriverDashboardStats >('/driver/stats')
    if (!res.success|| !res.data ) throw new Error('Error al obtener estadísticas')
    return res.data
  }
}
