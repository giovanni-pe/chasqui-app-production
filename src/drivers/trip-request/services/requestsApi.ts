// src/drivers/trip-requests/services/requestsApi.ts

import { api } from '@/lib/api';
import type { TripRequest } from '../types';

export const requestsApi = {
  /** Obtener solicitudes de viaje cercanas */
  async getRequests(latitude?: number, longitude?: number): Promise<TripRequest[]> {
    let endpoint = '/driver/trip-requests';
    if (latitude !== undefined && longitude !== undefined) {
      endpoint += `?latitude=${latitude}&longitude=${longitude}`;
    }

    const resp = await api.get<TripRequest[]>(endpoint);
    if (!resp.success || !resp.data) throw new Error(resp.message || 'Error al obtener solicitudes');

    console.log('[Driver] Trip requests:', resp.data);
    return resp.data;
  },

  /** Aceptar una solicitud de viaje */
  async accept(tripId: number, finalPrice:number): Promise<void> {
    const resp = await api.post<{ success: boolean; message?: string }>(`/driver/trips/accept`, {
      trip_request_id: tripId,
      final_price: finalPrice,
    });

    if (!resp.success) throw new Error(resp.message || 'Error al aceptar viaje');
  },

  /** Rechazar una solicitud con razón opcional */
  async reject(tripId: number, reason?: string): Promise<void> {
    const resp = await api.post<{ success: boolean; message?: string }>(`/driver/trip-requests/reject`, {
      trip_request_id: tripId,
      reason,
    });

    if (!resp.success) throw new Error(resp.message || 'Error al rechazar viaje');
  },
};
