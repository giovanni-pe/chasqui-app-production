// src/passengers/dashboard/types.ts
export interface PassengerDashboardStats {
  total_trips:      number;
  completed_trips:  number;
  cancelled_trips:  number;
  total_spent:      number;
  averageRating:    number;
  savedLocations:   number;
}

export interface PassengerQuickAction {
  id:          string;
  title:       string;
  description: string;
  icon:        string;        // nombre Iconify
  action:      () => void;
  disabled?:   boolean;
}

export interface PassengerDashboardState {
  stats:        PassengerDashboardStats | null;
  quickActions: PassengerQuickAction[];
  loading:      boolean;
  error:        string | null;
}

export interface PassengerDashboardActions {
  loadPassengerDashboard:   () => Promise<void>;
  refreshPassengerStats:    () => Promise<void>;
  clearPassengerError:      () => void;
}

export interface PassengerDashboardContextType {
  state:   PassengerDashboardState;
  actions: PassengerDashboardActions;
}
