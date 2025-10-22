// src/drivers/earnings/services/earningsApi.ts
import { api } from '../../../lib/api';
import type { EarningsSummary, EarningsRecord } from '../types';

export const earningsApi = {
  getSummary: async (): Promise<EarningsSummary> => {
    const res = await api.get< EarningsSummary >('/driver/earnings/summary');
    if (!res.success) throw new Error(res.message || 'Error fetching summary');
    return res.data!;
  },

  getRecords: async (): Promise<EarningsRecord[]> => {
    const res = await api.get< EarningsRecord[] >('/driver/earnings/records');
    if (!res.success) throw new Error(res.message || 'Error fetching records');
    return res.data!;
  },
};
