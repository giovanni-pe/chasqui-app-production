// src/passengers/collective/collective-request/store/useCollectiveRequestStore.ts
import { defineStore } from 'pinia';
import { collectiveRequestApi } from '../service/collectiveRequestApi';
import type {
  Location,
  CollectiveTrip,
  CollectiveReservationRequest,
  CollectiveReservationResponse,
} from '../types';

export const useCollectiveRequestStore = defineStore('collectiveRequest', {
  state: () => ({
    trips: [] as CollectiveTrip[],                 // Todos los colectivos activos en el mapa/lista
    selectedTrip: null as CollectiveTrip | null,   // El colectivo seleccionado (detalle abierto)
    showDetail: false,                             // Estado de detalle abierto/cerrado
    pickup: null as Location | null,               // Punto de recojo del pasajero
    notes: '',                                     // Notas para reserva
    whatsapp: '',                                  // Whatsapp opcional
    reservation: null as CollectiveReservationResponse | null,
    loading: false,
    error: null as string | null,
    formStep: 1,                                   // PASO del formulario (1: Colectivo, 2: Pickup, 3: Confirmar, 4: Éxito)
  }),
  getters: {
    isReadyToReserve(state): boolean {
      return !!(state.pickup && state.selectedTrip);
    },
  },
  actions: {
    // Setters
    setTrips(trips: CollectiveTrip[]) { this.trips = trips; },
    setSelectedTrip(trip: CollectiveTrip | null) {
      this.selectedTrip = trip;
      this.showDetail = !!trip;
      if (!trip) this.pickup = null;
      this.notes = '';
      this.whatsapp = '';
      this.reservation = null;
      this.formStep = 1;
    },
    setShowDetail(val: boolean) { this.showDetail = val; },
    setPickup(loc: Location | null) { this.pickup = loc; },
    setNotes(val: string) { this.notes = val; },
    setWhatsapp(val: string) { this.whatsapp = val; },
    setReservation(res: CollectiveReservationResponse | null) { this.reservation = res; },
    setError(val: string | null) { this.error = val; },
    setFormStep(step: number) { this.formStep = step; },

    reset() {
      this.selectedTrip = null;
      this.showDetail = false;
      this.pickup = null;
      this.notes = '';
      this.whatsapp = '';
      this.reservation = null;
      this.error = null;
      this.loading = false;
      this.formStep = 1;
    },

    async fetchAvailableTrips(params?: Record<string, any>) {
      this.loading = true;
      this.error = null;
      try {
        const trips = await collectiveRequestApi.getAvailableTrips(params);
        this.setTrips(trips);
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async reserveSeat(notesOverride?: string, whatsappOverride?: string) {
      if (!this.isReadyToReserve) {
        this.error = 'Selecciona un colectivo y tu punto de recojo';
        return false;
      }
      this.loading = true;
      this.error = null;
      try {
        const t = this.selectedTrip!;
        const req: CollectiveReservationRequest = {
          trip_id: t.id,
          pickup_latitude: this.pickup!.coordinates.latitude,
          pickup_longitude: this.pickup!.coordinates.longitude,
          pickup_address: this.pickup!.address,
          destination_latitude: t.destination_latitude,
          destination_longitude: t.destination_longitude,
          destination_address: t.destination_address,
          passenger_notes: notesOverride ?? this.notes,
          whatsapp_contact: whatsappOverride ?? this.whatsapp,
        };
        const resp = await collectiveRequestApi.reserve(req);
        this.setReservation(resp);
        return true;
      } catch (e: any) {
        this.error = e.message;
        return false;
      } finally {
        this.loading = false;
      }
    },
  }
});
