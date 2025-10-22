// Tipo para solicitud de reserva colectiva
export interface CollectiveReservationRequest {
  trip_id: number;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  passenger_notes?: string;
  pickup_eta?: string;
  whatsapp_contact?: string;
}

// Respuesta de reserva realizada
export interface CollectiveReservationResponse {
  id: number;
  trip_id: number;
  user_id: number;
  pickup_address: string;
  destination_address: string;
  status: 'reserved'|'aboard'|'dropped'|'cancelled';
  fare?: number;
  seat_number?: number;
  created_at: string;
  [key: string]: any;
}

// Viaje colectivo disponible
export interface CollectiveTrip {
  id: number;
  trip_code: string;
  pickup_address: string;
  destination_address: string;
  status: string;
  estimated_fare: number;
  max_passengers: number;
  reserved_seats: number;
  driver: { id: number; name: string };
  vehicle: { id: number; plate: string; brand: string; model: string };
  [key: string]: any;
}

// Ubicación para selección en mapa/autocomplete
export interface Location {
  coordinates: { latitude: number; longitude: number };
  address: string;
}
