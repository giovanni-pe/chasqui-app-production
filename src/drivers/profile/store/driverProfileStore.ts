import { defineStore } from 'pinia'
import type {
  DriverProfile,
  DriverProfileUpdate,
  DriverRegistrationPayload,
  DriverRegistrationResponse,
  Vehicle,
  VehicleUpdate
} from '../types'
import { driverProfileApi } from '../services/driverProfileApi'

export const useDriverProfileStore = defineStore('driverProfile', {
  // 🪫 STATE
  state: () => ({
    profile: null as DriverProfile | null,
    vehicles: [] as Vehicle[],
    loading: false,
    error: null as string | null,
     registrationSuccess: null as string | null,
    registrationData: null as DriverRegistrationResponse | null,
  }),

  // 🧠 GETTERS (opcional)
  getters: {
    hasError: (state) => !!state.error,
    isProfileLoaded: (state) => !!state.profile,
  },

  // ⚙️ ACTIONS
  actions: {
    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        this.profile = await driverProfileApi.getProfile()
      } catch (e: any) {
        this.error = e.message || 'Error al cargar perfil'
      } finally {
        this.loading = false
      }
    },

    async fetchVehicles() {
      this.loading = true
      this.error = null
      try {
        this.vehicles = await driverProfileApi.getVehicles()
      } catch (e: any) {
        this.error = e.message || 'Error al cargar vehículos'
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data: DriverProfileUpdate) {
      this.loading = true
      this.error = null
      try {
        this.profile = await driverProfileApi.updateProfile(data)
      } catch (e: any) {
        this.error = e.message || 'Error al actualizar perfil'
      } finally {
        this.loading = false
      }
    },

    async addVehicle(payload: Partial<Vehicle>) {
      this.loading = true
      this.error = null
      try {
        await driverProfileApi.addVehicle(payload)
        await this.fetchVehicles()
      } catch (e: any) {
        this.error = e.message || 'Error al agregar vehículo'
      } finally {
        this.loading = false
      }
    },

    async updateVehicle(vehicleId: string, data: VehicleUpdate) {
      this.loading = true
      this.error = null
      try {
        await driverProfileApi.updateVehicle(vehicleId, data)
        await this.fetchVehicles()
      } catch (e: any) {
        this.error = e.message || 'Error al actualizar vehículo'
      } finally {
        this.loading = false
      }
    },

async registerDriver(payload: DriverRegistrationPayload) {
      this.loading = true
      this.error = null
      this.registrationSuccess = null
      this.registrationData = null
      try {
        const response = await driverProfileApi.registerDriver(payload)
        this.registrationData = response
        this.registrationSuccess = response.status === 'pending_verification'
          ? 'Registro enviado. Espera verificación.'
          : 'Conductor registrado correctamente.'
      } catch (e: any) {
        this.error = e.message || 'Error al registrar como conductor'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
