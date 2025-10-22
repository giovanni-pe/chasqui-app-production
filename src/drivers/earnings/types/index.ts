// src/drivers/earnings/types/index.ts

export interface EarningsSummary {
  total_earnings: number;
  total_trips: number;
  today_earnings: number;
  last_week_earnings: number;
}

export interface EarningsRecord {
  date: string;        // YYYY-MM-DD
  earnings: number;
}

export interface EarningsContextType {
  summary: EarningsSummary | null;
  records: EarningsRecord[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  clearError: () => void;
}
