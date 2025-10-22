// src/drivers/status/types/index.ts

export type DriverStatusValue = 'online' | 'offline' | 'busy';

export interface DriverStatus {
  driver_status: DriverStatusValue;
  documents_verified: boolean;
  active_vehicle_id: number | null;
  last_status_change: string | null;
}

export interface Vehicle {
  id: number;
  vehicle_type: string;
  brand: string;
  model: string;
  license_plate: string;
  color: string;
  year: number;
  vehicle_status: 'active' | 'maintenance' | 'inactive';
}

export interface StatusState {
  status: DriverStatus | null;
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

export interface StatusActions {
  fetchStatus: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  updateStatus: (status: DriverStatusValue, vehicleId?: number) => Promise<void>;
}
