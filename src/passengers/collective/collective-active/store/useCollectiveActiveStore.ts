import { defineStore } from 'pinia';
import { collectiveActiveApi } from '../service/collectiveActiveApi';
import type { CollectiveTrip, TripPassenger } from '../types';

export const useCollectiveActiveStore = defineStore('collectiveActivePassenger', {
  state: () => ({
    trip: null as CollectiveTrip | null,
    myReservation: null as TripPassenger | null,
    loading: false,
    error: '',
    actionLoading: false,
  }),
  getters: {
    tripStatus(state) {
      return state.trip?.status ?? '';
    },
    myStatus(state) {
      return state.myReservation?.status ?? '';
    },
    isAboard(state) {
      return state.myReservation?.status === 'aboard';
    },
    isReserved(state) {
      return state.myReservation?.status === 'reserved';
    },
    isDropped(state) {
      return state.myReservation?.status === 'dropped';
    },
    isCancelled(state) {
      return state.myReservation?.status === 'cancelled';
    }
  },
  actions: {
    async fetchActiveTrip() {
      this.loading = true;
      this.error = '';
      try {
        const trip = await collectiveActiveApi.getActiveTrip();
        console.log('Active trip:', trip);
        this.trip = trip;
        if (trip) {
          this.myReservation = await collectiveActiveApi.getMyReservation(trip.id);
        } else {
          this.myReservation = null;
        }
      } catch (e: any) {
        this.error = e.message || 'Error al cargar tu viaje';
      } finally {
        this.loading = false;
      }
    },
    async markAboard() {
      if (!this.trip) return;
      this.actionLoading = true;
      this.error = '';
      try {
        this.myReservation = await collectiveActiveApi.markAboard(this.trip.id);
      } catch (e: any) {
        this.error = e.message || 'Error al marcar abordo';
      } finally {
        this.actionLoading = false;
      }
    },
    async markDropped() {
      if (!this.trip) return;
      this.actionLoading = true;
      this.error = '';
      try {
        this.myReservation = await collectiveActiveApi.markDropped(this.trip.id);
      } catch (e: any) {
        this.error = e.message || 'Error al marcar bajada';
      } finally {
        this.actionLoading = false;
      }
    },
    async cancelReservation() {
      if (!this.trip) return;
      this.actionLoading = true;
      this.error = '';
      try {
        await collectiveActiveApi.cancelReservation(this.trip.id);
        this.myReservation = null;
        this.trip = null;
      } catch (e: any) {
        this.error = e.message || 'Error al cancelar reserva';
      } finally {
        this.actionLoading = false;
      }
    },
    reset() {
      this.trip = null;
      this.myReservation = null;
      this.loading = false;
      this.actionLoading = false;
      this.error = '';
    }
  }
});
