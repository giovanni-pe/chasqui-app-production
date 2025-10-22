// src/drivers/profile/services/driverProfileApi.ts
import { api } from '@/lib/api'
import type { DriverProfile, DriverProfileUpdate, DriverRegistrationPayload, DriverRegistrationResponse, Vehicle, VehicleUpdate } from '../types'

export const driverProfileApi = {
  async getProfile(): Promise<DriverProfile> {
     const { success, data, message } = await api.get< DriverProfile >('/driver/profile')
     if (!success || !data) throw new Error(message || 'Error al obtener perfil');
    return data;
  },

  async updateProfile(payload: DriverProfileUpdate): Promise<DriverProfile> {
    const res = await api.post< DriverProfile >('/driver/profile/update', payload)
    if (!res.success || !res.data) throw new Error('Error al actualizar perfil')
    return res.data
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res = await api.get<Vehicle[]>('/driver/vehicles')
    if (!res.success || !res.data) throw new Error('Error al obtener vehículos')
    return res.data
  },

  async addVehicle(payload: Partial<Vehicle>): Promise<Vehicle> {
    const res = await api.post< Vehicle >('/driver/vehicles/add', payload)
    if (!res.success || !res.data) throw new Error('Error al agregar vehículo')
    return res.data
  },

  async updateVehicle(vehicleId: string, payload: VehicleUpdate): Promise<Vehicle> {
    const res = await api.put< Vehicle >(`/driver/vehicles/${vehicleId}`, payload)
    if (!res.success || !res.data) throw new Error('Error al actualizar vehículo')
    return res.data
  },
   async registerDriver(
    payload: DriverRegistrationPayload
  ): Promise<DriverRegistrationResponse> {
    const res = await api.post< DriverRegistrationResponse >(
      '/driver/register',
      payload
    );

    if (!res.success || !res.data) {
      throw new Error(res.message || 'Error al registrar conductor');
    }

    return res.data;
  },
}
