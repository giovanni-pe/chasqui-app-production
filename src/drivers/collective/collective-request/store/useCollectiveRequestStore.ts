// src/drivers/collective/collective-request/store/useCollectiveRequestStore.ts
import { defineStore } from 'pinia';
import { collectiveRequestApi } from '../service/collectiveRequestApi';
import type { CollectiveTripCreate, CollectiveTripResponse, Location } from '../types';

export const useCollectiveRequestStore = defineStore('collectiveRequest', {
  state: () => ({
    origin: null as Location | null,
    destination: null as Location | null,
    serviceTypeId: null as number | null,
    vehicleId: null as number | null,
    maxPassengers: 4 as number,
    estimatedFare: null as number | null,
    status: 'idle' as 'idle' | 'creating' | 'created' | 'error',
    loading: false,
    error: null as string | null,
    createdTrip: null as CollectiveTripResponse | null,
    activeSelection: null as 'origin' | 'destination' | null,
  }),

  getters: {
    isFormComplete(state) {
      return (
        !!state.origin &&
        !!state.destination &&
        !!state.serviceTypeId &&
        !!state.vehicleId &&
        !!state.maxPassengers
      );
    },
    step(state): 1 | 2 | 3 | 4 {
      if (!state.origin) return 1;
      if (!state.destination) return 2;
      if (!state.serviceTypeId || !state.vehicleId) return 3;
      return 4;
    },
  },

  actions: {
    setOrigin(val: Location | null) {
      this.origin = val;
    },
    setDestination(val: Location | null) {
      this.destination = val;
    },
    setServiceTypeId(val: number | null) {
      this.serviceTypeId = val;
    },
    setVehicleId(val: number | null) {
      this.vehicleId = val;
    },
    setMaxPassengers(val: number) {
      this.maxPassengers = val;
    },
    setEstimatedFare(val: number | null) {
      this.estimatedFare = val;
    },
    setActiveSelection(val: 'origin' | 'destination' | null) {
      this.activeSelection = val;
    },
    setError(val: string | null) {
      this.error = val;
    },
    setStatus(val: 'idle' | 'creating' | 'created' | 'error') {
      this.status = val;
    },

    async createCollectiveTrip() {
      if (!this.isFormComplete) {
        this.error = 'Completa todos los campos obligatorios';
        return false;
      }
      this.loading = true;
      this.status = 'creating';
      this.error = null;

      try {
        const payload: CollectiveTripCreate = {
          pickup_latitude: this.origin!.coordinates.latitude,
          pickup_longitude: this.origin!.coordinates.longitude,
          pickup_address: this.origin!.address,
          destination_latitude: this.destination!.coordinates.latitude,
          destination_longitude: this.destination!.coordinates.longitude,
          destination_address: this.destination!.address,
          service_type_id: this.serviceTypeId!,
          vehicle_id: this.vehicleId!,
          max_passengers: this.maxPassengers,
          ...(this.estimatedFare ? { estimated_fare: this.estimatedFare } : {})
        };

        const trip = await collectiveRequestApi.create(payload);
        this.createdTrip = trip;
        this.status = 'created';
        return true;
      } catch (e: any) {
        this.error = e.message || 'Error al crear el viaje colectivo';
        this.status = 'error';
        return false;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.origin = null;
      this.destination = null;
      this.serviceTypeId = null;
      this.vehicleId = null;
      this.maxPassengers = 4;
      this.estimatedFare = null;
      this.status = 'idle';
      this.loading = false;
      this.error = null;
      this.createdTrip = null;
      this.activeSelection = null;
    },
  },
});
