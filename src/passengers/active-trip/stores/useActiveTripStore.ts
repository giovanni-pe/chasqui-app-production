// src/passengers/active-trip/stores/useActiveTripStore.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ActiveTrip, Coordinates, DriverOffer, TripPhase ,AcceptedOffer} from '../types';
import { activeTripApi } from '../services/activeTripApi';
import { mqttService } from '@/lib/mqtt';
import { router } from "@/router"
import type { ChatMessage } from '@/drivers/trip-request/types';
export const useActiveTripStore = defineStore('activeTrip', {
  state: () => ({
    trip: null as ActiveTrip | null,
    offers: [] as DriverOffer[],
    initialized: false,
    stopStatus: null as (() => void) | null,
    ratingVisible: false,
    loadingRate: false,
    error: null as string | null,
    // NUEVO
    chatMessages: {} as Record<number, ChatMessage[]>,
    chatInputs: {} as Record<number, string>,
     expanded: false,
     acceptedOffer: null as AcceptedOffer | null,

  }),

  getters: {
    isPending: (state) => state.trip?.status === 'pending',
    hasDriver: (state) => !!state.trip?.driver,
    sortedOffers: (state) => [...state.offers].sort((a, b) => a.price - b.price),
  },

  actions: {
    setAcceptedOffer(offer: AcceptedOffer) {
    this.acceptedOffer = offer;
  },
  // ...
    async fetchActiveTrip() {
      try {
        const data = await activeTripApi.getActive();
        console.debug('[ActiveTrip] GET /trips/active →', data);
        if (data) {
          this.trip = data;

          /* 🔄 reinicia el listener */
          this.stopStatus?.();
          this.stopStatus = this.listenStatusMqtt(data.id);
        }
      } catch (err) {
        console.error('[ActiveTrip] error getActive', err);
      } finally {
        this.initialized = true;
      }
    },

    listenOffersMqtt(tripId: number) {
      const topic = `chasqui/trip_offers/${tripId}`;

      const handler = (msg: any) => {
        try {
          console.log('conductor mqtt', msg)
          const offer = msg.payload;
          console.log(offer)
          const exists = this.offers.some(o => o.driverId === offer.driver_id);
          if (!exists) {
            this.offers.push({
              driverId: offer.driver_id,
              name: offer.driver.name,
              rating: offer.driver.rating,
              price: offer.price,
              vehicle: offer.driver.vehicle,
              distanceMeters: 0,
              location: offer.location,
            });
          }
        } catch (e) {
          console.warn('[MQTT] Error parsing offer:', e);
        }
      };

      mqttService.subscribe(topic, handler);
      return () => mqttService.unsubscribe(topic, handler);
    },

    async acceptDriver(driverId: number) {
      if (!this.trip) return;

      try {
        await activeTripApi.acceptDriver(this.trip.id, driverId);
        const updated = await activeTripApi.getActive();
        this.trip = updated;
        this.offers = [];

        mqttService.publish(
          `chasqui/trip_status/${this.trip?.id}`,
          JSON.stringify({
            status: 'accepted',
            driver_id: driverId,
          })
        );
      } catch (e) {
        console.error('[ActiveTrip] Error accepting driver', e);
      }
    },

    async cancelTrip() {
      if (!this.trip) return;

      try {
        await activeTripApi.cancelTrip(this.trip.id);
        mqttService.publish(
          `chasqui/trip_status/${this.trip.id}`,
          JSON.stringify({ status: 'cancelled_by_passenger' }),
          { retain: true }
        );
        this.trip = null;
        this.offers = [];
        this.stopStatus?.();
        this.stopStatus = null;
      } catch (e) {
        console.error('[ActiveTrip] Error cancelling trip', e);
      }
    },

    setTrip(newTrip: ActiveTrip | null) {
      this.trip = newTrip;
    },

    updateDriverLocation(location: Coordinates) {
      if (this.trip?.driver) {
        this.trip = {
          ...this.trip,
          driver: {
            ...this.trip.driver,
            location,
          },
        };
      }
    },
    listenStatusMqtt(tripId: number) {
      const topic = `chasqui/trip_status/${tripId}`;

      const handler = ({ payload }: any) => {
        try {
          const data = payload as { status: string; driver_id?: number };
          if (!this.trip) return;
          console.log('Aqui llega el mqtt', data)
          /* mapa MQTT → TripPhase */
          const map: Record<string, TripPhase> = {
            accepted: 'driver_assigned',
            en_route: 'en_route',
            arrived: 'arrived',
            in_progress: 'in_progress',
            completed: 'completed',
            cancelled: 'cancelled',
            cancelled_by_passenger: 'cancelled',
          };

          const phase = map[data.status];
          if (!phase) return;  // ignora estados no mapeados

          this.trip = {
            ...this.trip,
            status: phase,
            driver: data.driver_id
              ? (this.trip.driver ?? {
                id: data.driver_id,
                name: '',
                phone: '',
                vehicle: '',
                rating: 0,
                location: { latitude: 0, longitude: 0 },
              })
              : this.trip.driver,
          };

          /* borra ofertas cuando ya hay conductor */
          if (phase === 'driver_assigned') this.offers = [];
        } catch (err) {
          console.warn('[MQTT] trip_status parse error:', err);
        }

      };

      mqttService.subscribe(topic, handler);
      return () => mqttService.unsubscribe(topic, handler);
    },
    initWatcher() {
      watch(
        () => this.trip?.status,
        (s) => { if (s === 'completed') this.ratingVisible = true; }
      );
    },
    async sendRating(data: { rating: number; comment?: string }) {
      if (!this.trip) return;
      this.loadingRate = true; this.error = null;
      try {
        //  await activeTripApi.rateDriver(this.trip.id, data);
        this.ratingVisible = false;
        router.push('/passenger/dashboard');      // o tu ruta
      } catch (e: any) {
        this.error = e.message || 'Error al enviar calificación';
      } finally { this.loadingRate = false; }
    },
    pushChatMessage(driverId: number, msg: ChatMessage) {
      if (!this.chatMessages[driverId]) this.chatMessages[driverId] = [];
      // Evitar duplicados exactos por timestamp+rol+mensaje
      const exists = this.chatMessages[driverId].some(
        m => m.timestamp === msg.timestamp && m.role === msg.role && m.message === msg.message
      );
      if (!exists) this.chatMessages[driverId].push(msg);
    },
    setChatInput(driverId: number, value: string) {
      this.chatInputs[driverId] = value;
    },
    clearChatInput(driverId: number) {
      this.chatInputs[driverId] = '';
    }
  },

});
