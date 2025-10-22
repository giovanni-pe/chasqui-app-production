import { api } from '@/lib/api';
import type { CollectiveTrip, TripPassenger } from '../types';

export const collectiveActiveApi = {
  /** Obtiene el viaje colectivo activo del conductor */
  async getActiveTrip(): Promise<CollectiveTrip | null> {
    const { success, data, message } = await api.get('/collective-trips/active');
    if (!success || !data || Object.keys(data).length === 0) throw new Error(message || 'No se pudo obtener el viaje activo');
    return data as CollectiveTrip;
  }
  ,
  /** Lista los pasajeros del viaje */
  async listPassengers(tripId: number): Promise<TripPassenger[]> {
    const { success, data, message } = await api.get(`/collective-trips/${tripId}/passengers`);
    if (!success) throw new Error(message || 'No se pudo listar pasajeros');
    return data as TripPassenger[];
  },

  /** Marcar pasajero como a bordo */
  async markAboard(tripId: number, passengerId: number): Promise<TripPassenger> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/passengers/board`, { user_id: passengerId });
    if (!success) throw new Error(message || 'No se pudo marcar a bordo');
    return data as TripPassenger;
  },

  /** Marcar pasajero como bajado */
  async markDropped(tripId: number, passengerId: number): Promise<TripPassenger> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/passengers/drop`, { user_id: passengerId });
    if (!success) throw new Error(message || 'No se pudo marcar bajado');
    return data as TripPassenger;
  },

  /** Finalizar viaje colectivo */
  async completeTrip(tripId: number): Promise<CollectiveTrip> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/complete`, {});
    if (!success) throw new Error(message || 'No se pudo finalizar el viaje');
    return data as CollectiveTrip;
  },
  async startTrip(tripId: number): Promise<CollectiveTrip> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/start`, {});
    if (!success) throw new Error(message || 'No se pudo iniciar el viaje');
    return data as CollectiveTrip;
  },
};
