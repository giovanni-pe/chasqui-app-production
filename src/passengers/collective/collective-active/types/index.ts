export interface Driver {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  color: string;
  capacity: number;
}

export type PassengerStatus = 'reserved' | 'aboard' | 'dropped' | 'cancelled';

export interface TripPassenger {
  id: number;
  user_id: number;
  name: string;
  trip_id: number;
  status: PassengerStatus;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  boarded_at?: string;
  dropped_at?: string;
  seat_number?: number;
  whatsapp_contact?: string;
}

export type CollectiveTripStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_driver'
  | 'cancelled_by_passenger';

export interface CollectiveTrip {
  id: number;
  trip_code: string;
  status: CollectiveTripStatus;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  max_passengers: number;
  vehicle: Vehicle;
  driver: Driver;
  trip_started_at?: string;
  trip_completed_at?: string;
  passengers: TripPassenger[];
}
