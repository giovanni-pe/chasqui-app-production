// src/passenger/trip-history/types/index.ts

export interface TripHistoryItem {
  id: number;
  status: string; // completed | cancelled_by_passenger | cancelled_by_driver | ...
  pickup_address: string;
  destination_address: string;
  estimated_fare: string; // O number si prefieres convertirlo
  final_fare: string | null;
  distance_km: string;
  duration_minutes: number;
  service_type: string;
  driver: {
    name: string;
    rating_average: number | null;
  } | null;
  trip_date: string; // ISO date string
  created_at: string; // ISO date string
}

export interface TripHistoryResponse {
  trips: TripHistoryItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}
