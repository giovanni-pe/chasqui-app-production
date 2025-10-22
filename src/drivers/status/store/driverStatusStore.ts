import { defineStore } from 'pinia'
import type { DriverStatus, DriverStatusValue, Vehicle } from '../types'
import { statusApi } from '../services/statusApi'

export const useDriverStatusStore = defineStore('driverStatus', {
  // 🪫 STATE
  state: () => ({
    status: null as DriverStatus | null,
    vehicles: [] as Vehicle[],
    loading: false,
    error: null as string | null,
  }),

  // 🧠 GETTERS
  getters: {
    isOnline: (state) => state.status?.driver_status === 'online',
    activeVehicleId: (state) => state.status?.active_vehicle_id,
  },

  // ⚙️ ACTIONS
  actions: {
    async fetchStatus() {
      this.loading = true
      this.error = null
      try {
        this.status = await statusApi.getStatus()
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async fetchVehicles() {
      this.loading = true
      this.error = null
      try {
        this.vehicles = await statusApi.getVehicles()
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async updateStatus(newStatus: DriverStatusValue, vehicleId?: number) {
      this.loading = true
      this.error = null
      try {
        const idToUse = vehicleId ?? this.status?.active_vehicle_id
        await statusApi.updateStatus(newStatus, idToUse == null ? undefined : idToUse)
        await this.fetchStatus()
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
