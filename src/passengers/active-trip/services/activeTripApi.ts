// src/passengers/active-trip/services/activeTripApi.ts
import { api } from '@/lib/api';
import type { ActiveTrip, DriverOffer } from '../types';
import { mapTripResponseToActiveTrip } from './activeTripMapper';

export const activeTripApi = {
  /** Obtener viaje activo del pasajero */
getActive: async (): Promise<ActiveTrip | null> => {
  const { data } = await api.get<{ data: any }>('/trips/active');
  console.debug('[ActiveTrip] respuesta getActive →', data);

  return data ? mapTripResponseToActiveTrip(data) : null;
}
,
  /** Escuchar ofertas de conductores usando polling */
  listenDriverOffers: (tripId: number, cb: (offers: DriverOffer[]) => void) => {
    const interval = setInterval(async () => {
      const res = await api.get<DriverOffer[]>(`/trips/${tripId}/driver-offers`);
      cb(res?.data ?? []);
    }, 5000);
    return () => clearInterval(interval);
  },

  /** Aceptar conductor */
  acceptDriver: async (tripId: number, driverId: number) => {
    await api.post(`/drivers/trips/accept`, { trip_id: tripId, driver_id: driverId });
  },

  /** Cancelar viaje con motivo */
  cancelTrip: async (tripId: number, reason = 'passenger_request') => {
    console.log('llega trip id', tripId)
    await api.put(`/trips/${tripId}/cancel`, { reason });
  },
  rateDriver: async (
    tripId: number | string,
    payload: { rating: number; comment?: string | null }
  ): Promise<void> => {
    await api.post(`/passenger/trips/${tripId}/rate`, payload);  // Endpoint a tu backend
  },
};
