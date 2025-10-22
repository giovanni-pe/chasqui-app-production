import { defineStore } from 'pinia'
import type { PassengerProfile, SavedLocation } from '../types'
import { profileApi } from '../services/profileApi'

export const usePassengerProfileStore = defineStore('passengerProfile', {
  state: () => ({
    profile: null as PassengerProfile | null,
    savedLocations: [] as SavedLocation[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    hasError: (state) => !!state.error,
    isProfileLoaded: (state) => !!state.profile,
    hasSavedLocations: (state) => state.savedLocations.length > 0,
  },

  actions: {
    clearError() {
      this.error = null
    },

    async fetchProfile() {
      this.loading = true
      this.clearError()
      try {
        this.profile = await profileApi.getProfile()
      } catch (e: any) {
        this.error = e.message || 'Error al obtener el perfil'
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data: Partial<PassengerProfile>) {
      this.loading = true
      this.clearError()
      try {
        this.profile = await profileApi.updateProfile(data)
      } catch (e: any) {
        this.error = e.message || 'Error al actualizar el perfil'
      } finally {
        this.loading = false
      }
    },

    async fetchSavedLocations() {
      this.loading = true
      this.clearError()
      try {
        this.savedLocations = await profileApi.getSavedLocations()
      } catch (e: any) {
        this.error = e.message || 'Error al cargar ubicaciones'
      } finally {
        this.loading = false
      }
    },

    async addSavedLocation(data: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true
      this.clearError()
      try {
        const location = await profileApi.addSavedLocation(data)
        this.savedLocations.push(location)
      } catch (e: any) {
        this.error = e.message || 'Error al guardar ubicación'
      } finally {
        this.loading = false
      }
    },

    async deleteSavedLocation(id: number) {
      this.loading = true
      this.clearError()
      try {
        await profileApi.deleteSavedLocation(id)
        this.savedLocations = this.savedLocations.filter(loc => loc.id !== id)
      } catch (e: any) {
        this.error = e.message || 'Error al eliminar ubicación'
      } finally {
        this.loading = false
      }
    }
  }
})
