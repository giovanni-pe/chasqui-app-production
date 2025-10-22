// src/drivers/trip-requests/types/index.ts

/** Solicitud de viaje que ve el conductor */
export interface TripRequest {
  id: number;
  passenger_id: number;
  passenger_name: string;
  passenger_phone: string;
  passenger_rating: number;

  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;

  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;

  estimated_distance: number; // en km
  estimated_duration: number; // en minutos
  estimated_fare: number;     // en soles

  service_type: string;
  special_requests: string | null;

  created_at: string;
  expires_at: string;
  passenger_max_fare: number;
}

/** Estado del store de solicitudes */
export interface TripRequestsState {
  requests: TripRequest[];
  loading: boolean;
  error: string | null;
}

/** Acciones que el store debe implementar */
export interface TripRequestsActions {
  fetchRequests: (lat?: number, lng?: number) => Promise<void>;
  acceptRequest: (tripId: number) => Promise<void>;
  rejectRequest: (tripId: number, reason?: string) => Promise<void>;
}
export interface ChatMessage {
  sender: number;
  role: 'driver' | 'passenger';
  message: string;
  timestamp: string;
}
// types.ts
export interface AcceptedOffer {
  tripId: number;
  driverId: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  updatedBy: 'passenger' | 'driver';
  updatedAt: number;
}
