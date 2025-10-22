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

export interface TripPassenger {
  id: number;
  user_id: number;
  trip_id: number;
  name: string;
  status: 'reserved' | 'aboard' | 'dropped' | 'cancelled';
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

export interface CollectiveTrip {
  id: number;
  trip_code: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled_by_driver' | 'cancelled_by_passenger';
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
