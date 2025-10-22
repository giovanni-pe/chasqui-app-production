// Coordenadas geográficas
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Ubicación con dirección
export interface Location {
  coordinates: Coordinates;
  address: string;
}

// Estado del viaje en curso
export type TripPhase =
  | 'pending'          // Esperando ofertas de conductores
  | 'driver_assigned'  // Se asignó un conductor
  |'en_route'
  |'arrived'
  | 'in_progress'      // En ruta
  | 'completed'        // Finalizado
  | 'cancelled';       // Cancelado

// Oferta individual de conductor
export interface DriverOffer {
  driverId: number;
  name: string;
  pictureUrl?: string;
  vehicle: string;
  price: number;
  rating: number;
  distanceMeters: number;
  location: Coordinates;
}

// Representación del viaje activo
export interface ActiveTrip {
  id: number;
  pickup: Location;
  destination: Location;
  serviceType: { id: number; name: string };
  status: TripPhase;
  estimatedFare: number;
  passenger_max_fare:number;
  driver?: {
    id: number;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    location: Coordinates;
  };
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


