import type { CompleteProfilePayload, LoginCredentials } from './../types';
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { authApi } from '../services/authApi'
import { APP_CONFIG } from '@/lib/constants'
import { mqttService } from '@/lib/mqtt'
import type { RegisterData, User } from '../types'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(`${APP_CONFIG.STORAGE_PREFIX}token`) as string | null,
    loading: true,
    error: null as string | null,
    LoginCredentials: null as LoginCredentials | null,
    formData: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      password: '',
      user_type: 'passenger',
    } as RegisterData,
    confirmPassword: '' as string,
    fieldErrors: {} as Record<string, string>,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },

  actions: {
    async initialise() {
      if (!this.token) {
        this.loading = false
        return
      }
      try {
        this.user = await authApi.getProfile()
        if (this.user?.id) mqttService.connect(this.user.id)
      } catch {
        this.token = null
        localStorage.removeItem(`${APP_CONFIG.STORAGE_PREFIX}token`)
      } finally {
        this.loading = false
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        this.loading = true
        this.error = null
        console.log(credentials)

        const response = await authApi.login(credentials)
        console.log('resputesta backend', response)
        const { user, token } = response;
        this.user = user
        this.token = token
        console.log("usuario en store", this.user)
        localStorage.setItem(`${APP_CONFIG.STORAGE_PREFIX}token`, token)
        if (user.id) mqttService.connect(user.id)
      } catch (e: any) {
        this.error = e?.message ?? 'Error en login'
        throw e
      } finally {
        this.loading = false
      }
    },

    async register() {
      this.fieldErrors = {}
      this.error = null
      this.loading = true
      try {
        const { user, token } = await authApi.register(this.formData)
        this.user = user
        this.token = token
        localStorage.setItem(`${APP_CONFIG.STORAGE_PREFIX}token`, token)
        mqttService.connect(user.id)
      } catch (err: any) {
        if (err.errors && typeof err.errors === 'object') {
          for (const [f, raw] of Object.entries(err.errors)) {
            const arr = Array.isArray(raw) ? raw : [String(raw)]
            this.fieldErrors[f] = arr[0]
          }
        } else {
          this.error = err.message ?? 'Error al registrar'
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem(`${APP_CONFIG.STORAGE_PREFIX}token`)
        mqttService.disconnect()
      }
    },

    async updateProfile(data: Partial<User>) {
      try {
        this.error = null
        this.user = await authApi.updateProfile(data)
        // Si cambia el ID (muy raro), reconecta
        if (this.user?.id) mqttService.connect(this.user.id)
      } catch (e: any) {
        this.error = e?.message ?? 'Error al actualizar perfil'
        throw e
      }
    },
    async ensureInitialized(): Promise<void> {
      if (!this.user && this.token) {
        await this.initialise();
      } else {
        this.loading = false;
      }
    }
    ,
    clearError() {
      this.error = null
    },
    /* ─────────────── Google Sign-In ─────────────── */
    async googleSignIn(idToken: string) {
      this.loading = true
      this.error = null
      try {
        const { user, token } = await authApi.googleSignIn(idToken)

        this.user = user      // ya viene con user_type = 'both' y roles asignados
        this.token = token
        localStorage.setItem(`${APP_CONFIG.STORAGE_PREFIX}token`, token)

        if (user.id) mqttService.connect(user.id)
      } catch (e: any) {
        this.error = e?.message ?? 'Error en Google Sign-In'
        throw e
      } finally {
        this.loading = false
      }
    },
     async completeProfile(payload: CompleteProfilePayload) {
      try {
        this.loading = true
        this.error   = null

        const user = await authApi.completeProfile(payload)
        this.user  = user                     // reactivo y 100 % actualizado

      } catch (e: any) {
        // Si backend devuelve err.errors (campo → msg) lo propagamos:
        if (e?.errors && typeof e.errors === 'object') throw e
        this.error = e?.message ?? 'Error al completar perfil'
        throw e
      } finally {
        this.loading = false
      }
    },

  },
})
