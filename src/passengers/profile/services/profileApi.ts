// src/passenger/profile/services/profileApi.ts

import { api } from '../../../lib/api';
import type { PassengerProfile, SavedLocation } from '../types';

export const profileApi = {
  async getProfile(): Promise<PassengerProfile> {
    const res = await api.get< PassengerProfile >('/passenger/profile');
    if (!res.success || !res.data ) throw new Error(res.message || 'No se pudo obtener el perfil');
    return res.data;
  },
  async updateProfile(profile: Partial<PassengerProfile>): Promise<PassengerProfile> {
    const res = await api.post<PassengerProfile >('/passenger/profile/update', profile);
    if (!res.success || !res.data) throw new Error(res.message || 'No se pudo actualizar el perfil');
    return res.data;
  },
  async getSavedLocations(): Promise<SavedLocation[]> {
    const res = await api.get<SavedLocation[] >('/passenger/saved-locations');
    if (!res.success || !res.data) throw new Error(res.message || 'No se pudieron obtener las ubicaciones guardadas');
    return res.data;
  },
  async addSavedLocation(data: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<SavedLocation> {
    const res = await api.post< SavedLocation >('/passenger/saved-locations', data);
    if (!res.success || !res.data) throw new Error(res.message || 'No se pudo guardar la ubicación');
    return res.data;
  },
  async deleteSavedLocation(id: number): Promise<void> {
    const res = await api.delete<{ success: boolean }>('/passenger/saved-locations/' + id);
    if (!res.success) throw new Error(res.message || 'No se pudo eliminar la ubicación');
  }
};
