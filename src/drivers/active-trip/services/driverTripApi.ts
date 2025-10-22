// src/drivers/active-trip/services/driverTripApi.ts
import { api } from '../../../lib/api';
import type { ActiveTrip } from '../types';

export const driverTripApi = {
  // Obtener viaje activo del conductor
  getActive: async (): Promise<ActiveTrip | null> => {
   const res = await api.get< ActiveTrip >('/driver/trips/current');
    if(!res.success || !res.data) return null 
    return res.data;
  },

  // Actualizar estado del viaje
  updateStatus: async (
    tripId: string,
    status: string,
    extraData?: Record<string, any>
  ): Promise<void> => {
    await api.put(`/driver/trips/${tripId}/status`, { status, ...extraData });
  },

  // Completar viaje
 completeTrip: async (
    tripId: string,
    payload: {
      final_latitude: number;
      final_longitude: number;
      actual_fare?: number;
      notes?: string;
    }
  ): Promise<void> => {
    await api.post('/driver/trips/complete', {
      trip_id: tripId,
      ...payload,
    });
  },
  ratePassenger: async (
    tripId: number | string,
    payload: { rating: number; comment?: string | null }
  ): Promise<void> => {
    // endpoint =  POST /driver/trips/{trip}/rate
    await api.post(`/driver/trips/${tripId}/rate`, payload);
  },
};
