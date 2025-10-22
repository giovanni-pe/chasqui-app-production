// src/drivers/dashboard/store/driverDashboardStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DriverDashboardStats } from '../types'
import { driverDashboardApi } from '../services/driverDashboardApi'

export const useDriverDashboardStore = defineStore('driverDashboard', () => {
  const stats   = ref<DriverDashboardStats | null>(null)
  const loading = ref(true)
  const error   = ref<string | null>(null)
 const activeTrip = ref(null)

  const hasActiveTrip = computed(() => !!activeTrip.value)
  // acción para recargar datos
  async function refresh() {
    loading.value = true
    error.value   = null
    try {
      stats.value = await driverDashboardApi.getStats()
    } catch (e: any) {
      error.value = e.message || 'Error al cargar dashboard'
    } finally {
      loading.value = false
    }
  }

  // carga inicial
  refresh()

  return {
    hasActiveTrip,
    stats,
    loading,
    error,
    refresh,
  }
})
