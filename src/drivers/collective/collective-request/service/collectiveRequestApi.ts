import { api } from '@/lib/api';
import type { CollectiveTripCreate, CollectiveTripResponse } from '../types';

export const collectiveRequestApi = {
  /** Crear un nuevo viaje colectivo */
  async create(data: CollectiveTripCreate): Promise<CollectiveTripResponse> {
    const { success, data: resp, message } = await api.post('/collective-trips', data);
    if (!success || !resp) throw new Error(message || 'No se pudo crear el viaje colectivo');
    return resp as CollectiveTripResponse;
  },
};
