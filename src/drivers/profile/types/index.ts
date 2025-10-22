// src/drivers/profile/types/index.ts
export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string;
  license_expiry_date: string | null;
  driver_status: string;
  documents_verified: boolean;
  total_earnings: number;
  completed_trips: number;
  rating_average: number;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  search_radius_km?: number;
  active_vehicle_id?: string | null;
  vehicle?:Vehicle|null;
}

export interface DriverProfileUpdate {
  license_expiry_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  search_radius_km?: number;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type: string;
  brand: string;
  model: string;
  license_plate: string;
  color: string;
  year: number;
  passenger_capacity: number;
  vehicle_status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface VehicleUpdate {
  color?: string;
  vehicle_status?: 'active' | 'maintenance' | 'inactive';
}
// src/drivers/profile/types.ts

export interface DriverRegistrationPayload {
  license_number: string;
  license_expiry_date: string; // Formato ISO: 'YYYY-MM-DD'
  vehicle_type: 'motorcycle' | 'car' | 'collective' | 'mototaxi';
  license_plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface DriverRegistrationResponse {
  driver_id: number;
  license_number: string;
  vehicle: string;
  license_plate: string;
  status: 'pending_verification' | 'verified';
}
