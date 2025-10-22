// src/passengers/collective/collective-request/service/collectiveRequestApi.ts

import { api } from '@/lib/api';
import type { CollectiveReservationRequest, CollectiveReservationResponse, CollectiveTrip } from '../types';

export const collectiveRequestApi = {
  /** Obtener colectivos activos cerca */
  async getAvailableTrips(params?: Record<string, any>): Promise<CollectiveTrip[]> {
    let url = '/collective-trips';
    if (params && Object.keys(params).length) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }
    const { success, data, message }: { success: boolean; data?: { data: CollectiveTrip[] }; message?: string } = await api.get(url);
    if (!success || !data) throw new Error(message || 'No se pudieron cargar colectivos');
    return data.data || [];
  },

  /** Reservar asiento en colectivo */
  async reserve(data: CollectiveReservationRequest): Promise<CollectiveReservationResponse> {
    const { success, data: resp, message } = await api.post(`/collective-trips/${data.trip_id}/passengers/reserve`, data);
    if (!success || !resp) throw new Error(message || 'No se pudo reservar asiento');
    return resp as CollectiveReservationResponse;
  }
};
