// src/drivers/active-trip/types/index.ts

export type TripStatus =
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ActiveTrip {
  id: string;
  trip_request_id: string;
  driver_id: string;
  passenger_id: string;
  passenger_name: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  trip_status: TripStatus;
  started_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  actual_fare: number | null;
  distance_traveled: number | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;

}
export type LatLngLiteral = {
  lat: number;
  lng: number;
};
