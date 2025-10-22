// Collective trip (para crear)
export interface CollectiveTripCreate {
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  service_type_id: number;
  vehicle_id: number;
  max_passengers: number;
  estimated_fare?: number;
}

// Respuesta de viaje colectivo creado
export interface CollectiveTripResponse {
  id: number;
  trip_code: string;
  status: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  destination_latitude: number;
  destination_longitude: number;
  destination_address: string;
  service_type_id: number;
  vehicle_id: number;
  max_passengers: number;
  estimated_fare: number;
  [key: string]: any; // Campos adicionales del backend
}

// Ubicación (para selección en mapa)
export interface Location {
  coordinates: { latitude: number; longitude: number };
  address: string;
}

// Otras interfaces útiles...
