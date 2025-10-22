// src/drivers/status/services/statusApi.ts
import { api } from '@/lib/api'
import type { DriverStatus, Vehicle, DriverStatusValue } from '../types'

export const statusApi = {
  async getStatus(): Promise<DriverStatus> {
    const resp = await api.get< DriverStatus >('/driver/status')
    if (!resp.success || !resp.data) throw new Error(resp.message || 'Error obteniendo status')
    return resp.data
  },

  async getVehicles(): Promise<Vehicle[]> {
    const resp = await api.get< Vehicle[] >('/driver/vehicles')
    if (!resp.success || !resp.data) throw new Error(resp.message || 'Error obteniendo vehículos')
    return resp.data
  },

  async updateStatus(
    status: DriverStatusValue,
    vehicleId?: number
  ): Promise<DriverStatus> {
    const resp = await api.post< DriverStatus >(
      '/driver/status',
      { status, vehicle_id: vehicleId }
    )
    if (!resp.success || !resp.data) throw new Error(resp.message || 'Error actualizando estado')
    return resp.data
  },
}
