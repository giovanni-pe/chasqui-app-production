import { defineStore } from 'pinia';
import { collectiveActiveApi } from '../service/collectiveActiveApi';
import type { CollectiveTrip, TripPassenger } from '../types';

type CollectiveTripStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_driver'
  | 'cancelled_by_passenger';

type ProgressStep = 0 | 1 | 2 | 3;

export const useCollectiveActiveStore = defineStore('collectiveActive', {
  state: () => ({
    trip: null as CollectiveTrip | null,
    passengers: [] as TripPassenger[],
    loading: false,
    error: '',
    completing: false,
    mapFocus: null as { lat: number; lng: number; zoom?: number } | null,
    focusedPassengerId: null as number | null,
  }),

  getters: {
    // Estado actual del viaje (flujo general del colectivo)
    tripStatus(state): CollectiveTripStatus {
      return state.trip?.status ?? 'pending';
    },
    // Paso visual para barra de progreso
    progressStep(state): ProgressStep {
      if (!state.trip) return 0;
      if (state.trip.status === 'completed') return 3;
      if (state.trip.status === 'in_progress') {
        // ¿Todos bajaron?
        if (state.passengers.every(p => p.status === 'dropped' || p.status === 'cancelled')) return 3;
        // ¿Todos a bordo?
        if (state.passengers.every(p => p.status !== 'reserved')) return 2;
        // Algunos a bordo, otros aún no suben
        return 1;
      }
      // pending (abierto a reservas)
      return 0;
    },
    occupancy(state): string {
      if (!state.trip) return '0/0';
      const total = state.trip.max_passengers || 0;
      const aboard = state.passengers.filter(p => p.status === 'aboard').length;
      return `${aboard}/${total}`;
    },
    reservedPassengers(state): TripPassenger[] {
      return state.passengers.filter(p => p.status === 'reserved');
    },
    aboardPassengers(state): TripPassenger[] {
      return state.passengers.filter(p => p.status === 'aboard');
    },
    droppedPassengers(state): TripPassenger[] {
      return state.passengers.filter(p => p.status === 'dropped');
    },
    isTripActive(state): boolean {
      return !!state.trip && (state.trip.status === 'pending' || state.trip.status === 'in_progress');
    },
    canCompleteTrip(state): boolean {
      // Se puede finalizar solo si todos están bajados o cancelados
      return (
        !!state.trip &&
        state.trip.status === 'in_progress' &&
        state.passengers.every(p => p.status === 'dropped' || p.status === 'cancelled')
      );
    },
    tripCode(state): string {
      return state.trip?.trip_code ?? '';
    },
    // Control visual para el mapa/pasajero
    getMapFocus(state) {
      return state.mapFocus;
    },
    getFocusedPassengerId(state) {
      return state.focusedPassengerId;
    },
  },

  actions: {
    // Acciones para centrar el mapa o enfocar pasajero (UX)
    focusPassenger(passengerId: number, lat: number, lng: number, zoom = 17) {
      this.focusedPassengerId = passengerId;
      this.mapFocus = { lat, lng, zoom };
    },
    clearFocus() {
      this.focusedPassengerId = null;
      this.mapFocus = null;
    },
    focusMapAt(lat: number, lng: number, zoom: number = 16) {
      this.focusedPassengerId = null;
      this.mapFocus = { lat, lng, zoom };
    },
    clearMapFocus() {
      this.mapFocus = null;
    },

    // --- Acciones principales del ciclo de viaje ---
    async fetchActiveTrip() {
      this.loading = true;
      this.error = '';
      try {
        const trip = await collectiveActiveApi.getActiveTrip();
        if (trip) {
          this.trip = trip;
          this.passengers = trip.passengers || [];
        } else {
          this.trip = null;
          this.passengers = [];
        }
      } catch (e: any) {
        this.error = e.message || 'No se pudo cargar el viaje activo';
      } finally {
        this.loading = false;
      }
    },

    async refreshPassengers() {
      if (!this.trip) return;
      try {
        this.passengers = await collectiveActiveApi.listPassengers(this.trip.id);
      } catch (e: any) {
        this.error = e.message || 'Error actualizando pasajeros';
      }
    },

    async markPassengerAboard(passengerId: number) {
      if (!this.trip) return;
      try {
        const updated = await collectiveActiveApi.markAboard(this.trip.id, passengerId);
        const idx = this.passengers.findIndex(p => p.id === updated.id);
        if (idx !== -1) this.passengers[idx] = updated;
      } catch (e: any) {
        this.error = e.message || 'Error al marcar a bordo';
      }
    },

    async markPassengerDropped(passengerId: number) {
      if (!this.trip) return;
      try {
        const updated = await collectiveActiveApi.markDropped(this.trip.id, passengerId);
        const idx = this.passengers.findIndex(p => p.id === updated.id);
        if (idx !== -1) this.passengers[idx] = updated;
      } catch (e: any) {
        this.error = e.message || 'Error al marcar bajada';
      }
    },

    async completeTrip() {
      if (!this.trip || !this.canCompleteTrip) return;
      this.completing = true;
      try {
        this.trip = await collectiveActiveApi.completeTrip(this.trip.id);
      } catch (e: any) {
        this.error = e.message || 'No se pudo finalizar el viaje';
      } finally {
        this.completing = false;
      }
    },

    reset() {
      this.trip = null;
      this.passengers = [];
      this.loading = false;
      this.error = '';
      this.completing = false;
      this.mapFocus = null;
      this.focusedPassengerId = null;
    },
  },
});
