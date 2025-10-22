// src/passenger/trip-history/services/historyApi.ts

import { api } from '../../../lib/api';
import type { TripHistoryResponse } from '../types';

export const historyApi = {
async fetchTrips({ page = 1, status }: { page?: number; status?: string }): Promise<TripHistoryResponse> {
  let qs = `?page=${page}`;
  if (status) qs += `&status=${encodeURIComponent(status)}`;

  const res = await api.get<TripHistoryResponse>(`/passenger/trip-history${qs}`);
   console.log('aqui llega el historial',res)
  if (!res.success || !res.data) {
    throw new Error(res.message || 'No se pudo cargar historial');
  }

  return res.data; // ✅ res.data ya es de tipo TripHistoryResponse
}

};
