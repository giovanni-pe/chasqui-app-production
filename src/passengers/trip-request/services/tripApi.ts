// src/trips/services/tripApi.ts
import { api } from '@/lib/api';
import type {
  TripRequestData,
  TripResponse,
} from '../types';

export const tripApi = {
  /** Crea un nuevo viaje */
  async create(data: TripRequestData): Promise<TripResponse> {
    const { success, data: d, message } = await api.post<TripResponse>('/trips', data);
    if (!success || !d) throw new Error(message || 'Error creating trip');
    return d;
  },

  /** Cancela un viaje existente */
  async cancel(tripId: string): Promise<void> {
    const { success, message } = await api.put<void>(`/trips/${tripId}/cancel`, {});
    if (!success) throw new Error(message || 'Error cancelling trip');
  },

  /** Obtiene el viaje activo o null si no hay ninguno */
  async getActiveTrip(): Promise<TripResponse | null> {
    const { success, data, message } = await api.get<TripResponse>('/trips/active');
    if (!success) throw new Error(message || 'Error fetching active trip');
    return data ?? null;
  },
};
