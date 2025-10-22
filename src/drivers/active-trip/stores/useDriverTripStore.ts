import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ActiveTrip, TripStatus } from '../types';
import { driverTripApi } from '../services/driverTripApi';
import { mqttService } from '@/lib/mqtt';
import { router } from '@/router';
export const useDriverTripStore = defineStore('driverTrip', () => {
  /* ─── state ─── */
  const trip = ref<ActiveTrip | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const ratingVisible = ref(false);

  watch(
    () => trip.value?.trip_status,          // 👈 observamos el campo status
    (status) => {
      if (status === 'completed') {
        ratingVisible.value = true;    // muestra RatingModal
      } else {
        ratingVisible.value = false;   // lo oculta en cualquier otro caso
      }
    },
    { immediate: true }                // opcional: evalúa al instanciar
  );

  /* mostrar modal cuando status completed */
  async function sendRating(data: { rating: number; comment?: string }) {
    if (!trip.value) return;
    loading.value = true; error.value = null;
    try {
      // await driverTripApi.ratePassenger(trip.value.id, data);   // ✅ nuevo servicio
      ratingVisible.value = false;

      /* (opcional) MQTT para avisar al pasajero que fue calificado */
      mqttService.publish(`chasqui/trip_status/${trip.value.id}`, {
        status: 'rated_by_driver',
        rating: data.rating,
      });

      router.push('/driver/dashboard');
    } catch (e: any) {
      error.value = e.message || 'Error al enviar calificación';
    } finally { loading.value = false; }
  }
  /* ─── actions ─── */
  async function fetchActiveTrip() {
    loading.value = true; error.value = null;
    try {
      trip.value = await driverTripApi.getActive();
    } catch (e: any) {
      error.value = e.message || 'Error al cargar el viaje';
    } finally { loading.value = false; }
  }

  async function updateStatus(status: TripStatus, extra?: Record<string, any>) {
    if (!trip.value) return;
    loading.value = true; error.value = null;

    try {
      /* REST backend */
      await driverTripApi.updateStatus(trip.value.id, status, extra);

      /* MQTT – mismo código que envías al backend */
      mqttService.publish(`chasqui/trip_status/${trip.value.id}`, {
        status,
        driver_id: trip.value.driver_id,
        ...(extra ?? {}),
      });

      /* refresh */
      await fetchActiveTrip();
    } catch (e: any) {
      error.value = e.message || 'Error al actualizar estado';
    } finally { loading.value = false; }
  }

  async function completeTrip(data: {
    final_latitude: number;
    final_longitude: number;
    actual_fare?: number | null;
    notes?: string;
  }) {
    if (!trip.value) return;
    loading.value = true; error.value = null;

    try {
      const clean = { ...data, actual_fare: data.actual_fare ?? undefined };
      await driverTripApi.completeTrip(trip.value.id, clean);

      /* MQTT – viaje completado */
      mqttService.publish(`chasqui/trip_status/${trip.value.id}`, {
        status: 'completed',
        driver_id: trip.value.driver_id,
        ...clean,
      });

      await fetchActiveTrip();

    } catch (e: any) {
      error.value = e.message || 'Error al completar viaje';
    } finally { loading.value = false; }
  }

  function clearError() {
    error.value = null;
  }

  /* Auto-fetch al instanciar (opcional) */
  fetchActiveTrip();

  return {
    trip,
    loading,
    error,
    ratingVisible,
    fetchActiveTrip,
    updateStatus,
    completeTrip,
    clearError,
    sendRating
  };
});
