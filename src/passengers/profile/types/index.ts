// src/passenger/profile/types/index.ts

export interface PassengerProfile {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}
