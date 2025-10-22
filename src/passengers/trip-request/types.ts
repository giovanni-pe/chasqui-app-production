// src/trips/types.ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: Coordinates;
  address: string;
}

export interface RouteInfo {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  polyline: string;
}

export interface TripRequestData {
  pickup_latitude:      number;
  pickup_longitude:     number;
  pickup_address:       string;
  destination_latitude: number;
  destination_longitude:number;
  destination_address:  string;
  service_type_id:      number;
  passenger_notes?:     string;
  offer_price?:         number;
  passenger_max_fare?: number;
}

export interface TripResponse {
  id:                string;
  trip_code:         string;
  status:            string;
  estimated_fare:    number;
  distance_km:       number;
  duration_minutes:  number;
  pickup_address:    string;
  destination_address:string;
  created_at:        string;
}

export type TripStatus =
  | 'idle'
  | 'pending'
  | 'searching_driver'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
