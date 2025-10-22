import { api } from '@/lib/api';
import type { CollectiveTrip, TripPassenger } from '../types';

export const collectiveActiveApi = {
  /** Obtiene el viaje colectivo activo del pasajero */
  async getActiveTrip(): Promise<CollectiveTrip | null> {
    const { success, data, message } = await api.get('/collective-trips/passenger/active');
    if (!success) throw new Error(message || 'No se pudo obtener tu viaje activo');
    return data && Object.keys(data).length > 0 ? (data as CollectiveTrip) : null;
  },

  /** Estado de mi reserva */
  async getMyReservation(tripId: number): Promise<TripPassenger> {
    const { success, data, message } = await api.get(`/collective-trips/${tripId}/passengers/me`);
    if (!success) throw new Error(message || 'No se pudo obtener el estado de tu reserva');
    return data as TripPassenger;
  },

  /** Marcar como a bordo */
  async markAboard(tripId: number): Promise<TripPassenger> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/passengers/board`, {});
    if (!success) throw new Error(message || 'No se pudo marcar a bordo');
    return data as TripPassenger;
  },

  /** Marcar como bajado */
  async markDropped(tripId: number): Promise<TripPassenger> {
    const { success, data, message } = await api.post(`/collective-trips/${tripId}/passengers/drop`, {});
    if (!success) throw new Error(message || 'No se pudo marcar bajado');
    return data as TripPassenger;
  },

  /** Cancelar mi reserva */
  async cancelReservation(tripId: number): Promise<void> {
    const { success, message } = await api.post(`/collective-trips/${tripId}/passengers/cancel`, {});
    if (!success) throw new Error(message || 'No se pudo cancelar tu reserva');
  }
};
