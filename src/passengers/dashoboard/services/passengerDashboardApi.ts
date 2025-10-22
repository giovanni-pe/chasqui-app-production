import { api } from '@/lib/api';
import type { PassengerDashboardStats } from '../types';

export const passengerDashboardApi = {
  /** Devuelve las estadísticas principales del panel de pasajero */
  async getPassengerStats(): Promise<PassengerDashboardStats> {
    const { success, data, message } =
      await api.get<PassengerDashboardStats>('/passenger/stats');

    if (!success || !data)
      throw new Error(message || 'Error loading passenger stats');

    return data;
  },
};
