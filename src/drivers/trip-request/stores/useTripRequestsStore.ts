import { router } from './../../../router/index';
import { defineStore } from 'pinia';
import type { TripRequest, ChatMessage, AcceptedOffer } from '../types';
import { requestsApi } from '../services/requestsApi';
import { publishDriverOffer, type LatLng } from '../services/driverOffersService';
import { useAuthStore } from '@/auth/stores/auth';
import { mqttService } from '@/lib/mqtt';

export const useTripRequestsStore = defineStore('tripRequests', {
  /* ───────── STATE ───────── */
  state: () => ({
    /* negocio */
    requests: [] as TripRequest[],
    loading: false,
    error: null as string | null,

    /* UI */
    drawerVisible: false,
    selectedTrip: null as TripRequest | null,
    /* chat */
    chatVisible: false,
    chatMessages: [] as ChatMessage[],
    chatTopic: '' as string,
    /* listener cleanup */
    stopTripReq: null as (() => void) | null,
    acceptedOffer: null as AcceptedOffer | null,
  }),

  /* ───────── GETTERS ───────── */
  getters: {
    sortedRequests: (state): TripRequest[] =>
      [...state.requests].sort((a, b) => a.estimated_fare - b.estimated_fare),

    hasError: (state): boolean => !!state.error,
    isDrawerOpen: (state): boolean => state.drawerVisible,
  },

  /* ───────── ACTIONS ───────── */
  actions: {
    /* --- solicitudes al backend ------------------------------------ */
    async fetchRequests(lat?: number, lng?: number) {
      this.loading = true; this.error = null;
      try {
        this.requests = await requestsApi.getRequests(lat, lng);
      } catch (e: any) {
        this.error = e.message || 'Error al obtener solicitudes';
      } finally {
        this.loading = false;
      }
    },

    async acceptRequest(tripId: number, finalPrice:number) {
      const auth = useAuthStore();
      this.loading = true; this.error = null;
      try {
        await requestsApi.accept(tripId, finalPrice);
        await this.fetchRequests();      // refresca lista
        if (!auth.user) {
          throw new Error('Usuario no autenticado');
        }
        mqttService.publish(`chasqui/trip_status/${tripId}`, {
          status: 'accepted',
          driver_id: auth.user.id,
        });
        /* quitar la solicitud de la lista */
        this.requests = this.requests.filter(r => r.id !== tripId);
        router.push('/driver/active-trip');
      } catch (e: any) {
        this.error = e.message || 'Error al aceptar viaje';
      } finally {
        this.loading = false;
      }
    },

    async rejectRequest(tripId: number, reason?: string) {
      this.loading = true; this.error = null;
      try {
        await requestsApi.reject(tripId, reason);
        await this.fetchRequests();
      } catch (e: any) {
        this.error = e.message || 'Error al rechazar viaje';
      } finally {
        this.loading = false;
      }
    },

    /* --- oferta del conductor -------------------------------------- */
    postulate(trip: TripRequest, price = trip.estimated_fare, location: LatLng | null = null) {
      const auth = useAuthStore();
      if (!auth.user) {
        this.error = 'Debes iniciar sesión para postularte.';
        return;
      }
      try {
        publishDriverOffer(trip.id, price, auth.user, location as LatLng);
      } catch (e: any) {
        this.error = e.message || 'Error al enviar oferta';
      }
    },

    /* --- UI helpers ------------------------------------------------- */
    openDrawer(trip: TripRequest) {
      this.selectedTrip = trip;
      this.drawerVisible = true;
      const auth = useAuthStore();
      const driverId = auth.user?.id;
      if (!driverId) return;

      this.chatTopic = `chasqui/chat/${trip.id}/${driverId}`;
      mqttService.unsubscribe(this.chatTopic);

      this.chatMessages = []; // limpia el historial local
      mqttService.subscribe(this.chatTopic, ({ payload }) => {
        this.chatMessages.push(payload as ChatMessage);
      });
    },
    closeDrawer() {
      this.drawerVisible = false;
    },


    openChat() {
      if (!this.selectedTrip) return;

      const auth = useAuthStore();
      const tripId = this.selectedTrip.id;
      const driverId = auth.user?.id;

      if (!driverId) return;

      // topic passenger↔driver (mismo usado por pasajero)
      this.chatTopic = `chasqui/chat/${tripId}/${driverId}`;

      // evita doble suscripción
      mqttService.unsubscribe(this.chatTopic);

      mqttService.subscribe(this.chatTopic, ({ payload }) => {
        this.chatMessages.push(payload as ChatMessage);
      });

      this.chatVisible = true;
      this.chatMessages = []; // limpia historial local
    },

    closeChat() {
      this.chatVisible = false;
    },

    sendChatMessage(text: string) {
      const auth = useAuthStore();
      if (!this.chatTopic || !auth.user) return;

      const msg: ChatMessage = {
        sender: Number(auth.user.id),
        role: 'driver',
        message: text,
        timestamp: new Date().toISOString(),
      };

      mqttService.publish(this.chatTopic, msg);

    },
    startTripRequestsMqtt(lat?: number, lng?: number) {
      /* evita doble suscripción */
      this.stopTripReq?.();

      const topic = 'chasqui/trip_requests';
      const handler = () => {
        // Al llegar un nuevo viaje → refresca lista del backend
        this.fetchRequests(lat, lng);
      };

      mqttService.subscribe(topic, handler);
      this.stopTripReq = () => mqttService.unsubscribe(topic, handler);
    }, stopTripRequestsMqtt() {
      this.stopTripReq?.();
      this.stopTripReq = null;
    },
  },
});
