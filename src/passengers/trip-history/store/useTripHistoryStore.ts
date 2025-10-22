// src/passenger/trip-history/stores/useTripHistoryStore.ts
import { defineStore } from 'pinia'
import { historyApi } from '../services/historyApi'
import type { TripHistoryItem } from '../types'

export type TripStatusFilter =
  | ''
  | 'completed'
  | 'cancelled_by_passenger'
  | 'cancelled_by_driver'
  | 'cancelled_by_system'

export const useTripHistoryStore = defineStore('tripHistory', {
  state: () => ({
    trips: [] as TripHistoryItem[],
    loading: false,
    error: null as string | null,
    statusFilter: '' as TripStatusFilter,
    
  }),

  getters: {
    hasError: (state) => !!state.error,
    isEmpty: (state) => state.trips.length === 0,
  },

  actions: {
    async fetchTrips(status?: TripStatusFilter) {
      this.loading = true
      this.error = null
      try {
        const response = await historyApi.fetchTrips({
          status: status ?? this.statusFilter,
        })
        this.trips = response.trips ?? []
      } catch (err: any) {
        this.error = err.message || 'No se pudo cargar historial'
      }
      this.loading = false
    },

    setStatusFilter(filter: TripStatusFilter) {
      this.statusFilter = filter
      this.fetchTrips()
    },
  },
})
