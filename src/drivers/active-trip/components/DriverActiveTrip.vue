<!-- src/drivers/active-trip/components/DriverActiveTrip.vue -->
<template>
  <div class="w-full h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-xl border-b border-white/30 px-4 py-3">
      <div class="flex items-center justify-between">
        <button class="p-2 rounded-xl hover:bg-white/50 transition-all duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-800">Viaje en Curso</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Mapa -->
    <div class="flex-1 relative">
      <div ref="mapRef" class="w-full h-full" />
    </div>

    <!-- Panel inferior -->
    <div class="bg-white/95 backdrop-blur-xl shadow-lg border-t border-white/30 p-4 space-y-4">
      <!-- Información del pasajero -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-800">{{ store.trip?.passenger_name || 'Pasajero' }}</p>
            <p class="text-sm text-gray-600 truncate">{{ store.trip?.destination_address || 'Destino' }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-800">S/ {{ store.trip ? Number(store.trip.actual_fare).toFixed(2) :
              '0.00' }}</p>
          </div>
        </div>
      </div>

      <!-- Componente de Navegación -->
      <TripNavigation />

      <!-- Botón de finalización -->
      <button :class="[
        'w-full font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2',
        completing
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02] shadow-lg'
      ]" :disabled="completing" @click="handleCompleteTrip">
        <svg v-if="completing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ completing ? 'Finalizando...' : 'Finalizar viaje' }}</span>
      </button>

      <!-- Error de geolocalización -->
      <div v-if="geoError" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span class="text-sm text-amber-800">Necesitas activar la ubicación del dispositivo para finalizar.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useDriverTripStore } from '@/drivers/active-trip/stores/useDriverTripStore';
import { useGeolocation } from '@/lib/composables/useGeolocation';
import { googleMapsService } from '@/location/services/googleMapsService';
import TripNavigation from './TripNavigation.vue';
import Swal from 'sweetalert2';
const store = useDriverTripStore();
const { position, error: geoError } = useGeolocation();

const mapRef = ref<HTMLDivElement | null>(null);
const mapInstance = ref<google.maps.Map | null>(null);
const directionsRenderer = ref<google.maps.DirectionsRenderer | null>(null);
const completing = ref(false);
const trip = store.trip;

const isValidLatLng = (lat?: any, lng?: any) =>
  typeof lat === 'number' && typeof lng === 'number' &&
  !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

onMounted(async () => {
  try {
    await googleMapsService.initialize();
  } catch (err) {
    console.error('No se pudo cargar Google Maps', err);
  }
});

watch(
  () => store.trip,
  (trip) => {
    if (
      !trip || !mapRef.value ||
      !isValidLatLng(+trip.pickup_latitude, +trip.pickup_longitude) ||
      !isValidLatLng(+trip.destination_latitude, +trip.destination_longitude)
    ) return;

    if (mapInstance.value) return;

    const pickLat = +trip.pickup_latitude;
    const pickLng = +trip.pickup_longitude;
    const destLat = +trip.destination_latitude;
    const destLng = +trip.destination_longitude;

    mapInstance.value = new window.google.maps.Map(mapRef.value, {
      center: { lat: pickLat, lng: pickLng },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
    });

    new window.google.maps.Marker({
      position: { lat: pickLat, lng: pickLng },
      map: mapInstance.value,
      label: '📍',
      title: 'Punto de recojo'
    });

    new window.google.maps.Marker({
      position: { lat: destLat, lng: destLng },
      map: mapInstance.value,
      label: '🏁',
      title: 'Destino'
    });
  },
  { immediate: true }
);

watch(
  () => store.trip,
  (trip) => {
    if (
      !trip || !mapInstance.value ||
      !isValidLatLng(+trip.pickup_latitude, +trip.pickup_longitude) ||
      !isValidLatLng(+trip.destination_latitude, +trip.destination_longitude)
    ) return;

    if (directionsRenderer.value) {
      directionsRenderer.value.setMap(null);
      directionsRenderer.value = null;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsRenderer.value = new window.google.maps.DirectionsRenderer({
      map: mapInstance.value,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeOpacity: 0.9,
        strokeWeight: 6,
      },
    });

    directionsService.route(
      {
        origin: { lat: +trip.pickup_latitude, lng: +trip.pickup_longitude },
        destination: { lat: +trip.destination_latitude, lng: +trip.destination_longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') directionsRenderer.value?.setDirections(result);
        else console.warn('No se pudo trazar la ruta:', status);
      }
    );
  },
  { immediate: true }
);

const handleCompleteTrip = async () => {
  if (!store.trip || !position.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Ubicación desactivada',
      text: 'Activa la ubicación para finalizar el viaje.',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
    return;
  }
  completing.value = true;
  try {
    await store.completeTrip({
      final_latitude: position.value.latitude,
      final_longitude: position.value.longitude,
      actual_fare: store.trip.actual_fare,
      notes: '',
    });

    store.trip = { ...store.trip, trip_status: 'completed' };
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al finalizar el viaje',
      text: 'Error al finalizar el viaje: ' + (e.message || 'Desconocido'),
      confirmButtonColor: '#e53e3e', // Rojo fuerte para errores
      confirmButtonText: 'Cerrar'
    });
  }
  completing.value = false;
};
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
</style>