// src/passengers/trip-request/stores/useTripRequestStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tripApi} from '../services/tripApi';
import { useAuthStore } from '../../../auth/stores/auth'; // Asegúrate de tener tu auth store migrada
import { mqttService } from '@/lib/mqtt';
import type { TripResponse } from '../types';

type Coordinates = { latitude: number; longitude: number };
type Location = { coordinates: Coordinates; address: string };

type RouteInfo = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  estimatedCost: number;
  polyline: string;
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    coordinates: Coordinates;
  }[];
};

type TripStatus = 'idle' | 'searching' | 'searching_driver' | 'confirmed' | 'in_progress' | 'completed';

export const useTripRequestStore = defineStore('tripRequest', () => {
  const origin = ref<Location | null>(null);
  const destination = ref<Location | null>(null);
  const routeInfo = ref<RouteInfo | null>(null);
  const serviceTypeId = ref<number | null>(null);
  const offerPrice = ref<number | null>(null);
  const notes = ref('');
  const status = ref<TripStatus>('idle');
  const loading = ref(false);
  const loadingMap = ref(false);
  const mapError = ref<string | null>(null);
  const activeSelection = ref<'origin' | 'destination' | null>(null);
  const currentTrip = ref<TripResponse | null>(null);
  const error = ref<string | null>(null);
  

  const auth = useAuthStore(); // ← usa el Pinia store de auth

  async function confirmTrip() {
    if (!origin.value || !destination.value || !serviceTypeId.value) return;

    loading.value = true;
    try {
      const payload: any = {
        pickup_latitude: origin.value.coordinates.latitude,
        pickup_longitude: origin.value.coordinates.longitude,
        pickup_address: origin.value.address,
        destination_latitude: destination.value.coordinates.latitude,
        destination_longitude: destination.value.coordinates.longitude,
        destination_address: destination.value.address,
        service_type_id: serviceTypeId.value,
        passenger_notes: notes.value,
      };

      if (offerPrice.value !== null) payload.passenger_max_fare = offerPrice.value;

      const resp = await tripApi.create(payload);
      currentTrip.value = resp;
      status.value = 'searching_driver';

      await mqttService.connect(auth.user?.id?.toString());

      mqttService.publish('chasqui/trip_requests', {
        trip_id: resp.id,
        trip_code: resp.trip_code,
        passenger_id: auth.user?.id,
        passenger_name: auth.user?.name,
        pickup: {
          lat: payload.pickup_latitude,
          lng: payload.pickup_longitude,
          address: payload.pickup_address,
        },
        destination: {
          lat: payload.destination_latitude,
          lng: payload.destination_longitude,
          address: payload.destination_address,
        },
        service_type_id: payload.service_type_id,
        estimated_fare: resp.estimated_fare,
        distance_km: resp.distance_km,
        duration_minutes: resp.duration_minutes,
        created_at: resp.created_at,
      });
      return true; 
    } catch (e) {
      error.value = 'Error al crear el viaje';
      status.value = 'idle';
       return false;     
    } finally {
      loading.value = false;
    }
  }

  async function cancelTrip() {
    loading.value = true;

    try {
      if (currentTrip.value) {
        await tripApi.cancel(currentTrip.value.id);
      }

      // Reset completo
      origin.value = null;
      destination.value = null;
      routeInfo.value = null;
      serviceTypeId.value = null;
      offerPrice.value = null;
      notes.value = '';
      status.value = 'idle';
      activeSelection.value = null;
      currentTrip.value = null;
      error.value = null;
    } catch {
      error.value = 'Error al cancelar el viaje';
    } finally {
      loading.value = false;
    }
  }

  return {
    origin,
    destination,
    routeInfo,
    serviceTypeId,
    offerPrice,
    notes,
    status,
    loading,
    loadingMap,
    mapError,
    activeSelection,
    currentTrip,
    error,

    // Setters
    setOrigin: (val: Location | null) => (origin.value = val),
    setDestination: (val: Location | null) => (destination.value = val),
    setRouteInfo: (val: RouteInfo | null) => (routeInfo.value = val),
    setServiceTypeId: (val: number) => (serviceTypeId.value = val),
    setOfferPrice: (val: number | null) => (offerPrice.value = val),
    setNotes: (val: string) => (notes.value = val),
    setActiveSelection: (val: 'origin' | 'destination' | null) => (activeSelection.value = val),
    setLoadingMap: (val: boolean) => (loadingMap.value = val),
    setMapError: (val: string | null) => (mapError.value = val),

    // Acciones
    confirmTrip,
    cancelTrip,
  };
});
