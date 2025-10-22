import { defineStore } from 'pinia'
import { earningsApi } from '../services/earningsApi'
import type { EarningsSummary, EarningsRecord } from '../types'

export const useEarningsStore = defineStore('earnings', {
  state: () => ({
    summary: null as EarningsSummary | null,
    records: [] as EarningsRecord[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    hasError: (state) => !!state.error,
    isEmpty: (state) => !state.summary && state.records.length === 0,
  },

  actions: {
    async fetchSummary() {
      this.loading = true
      this.error = null
      try {
        this.summary = await earningsApi.getSummary()
      } catch (e: any) {
        this.error = e.message || 'Error al cargar resumen'
      } finally {
        this.loading = false
      }
    },

    async fetchRecords() {
      this.loading = true
      this.error = null
      try {
        this.records = await earningsApi.getRecords()
      } catch (e: any) {
        this.error = e.message || 'Error al cargar historial'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
