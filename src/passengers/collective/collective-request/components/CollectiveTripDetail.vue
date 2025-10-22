<template>
  <div v-if="store.showDetail && store.selectedTrip" class="fixed top-0 right-0 md:right-8 w-full md:w-[410px] h-full bg-white z-50 shadow-2xl flex flex-col">
    <!-- Header y botón cerrar -->
    <div class="flex items-center justify-between p-4 border-b">
      <h2 class="text-xl font-bold text-[#22477D]">Detalle del colectivo</h2>
      <button @click="store.setShowDetail(false)" class="p-2 hover:bg-gray-100 rounded-full">
        <span class="mdi mdi-close"></span>
      </button>
    </div>
    <!-- Mini-mapa de ruta -->
    <div class="w-full h-48 p-4">
      <DetailMiniMap :trip="store.selectedTrip" :pickup="store.pickup" @pickup-selected="store.setPickup" />
    </div>
    <!-- Info -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="mb-2">
        <b>Ruta:</b>
        <div>{{ store.selectedTrip.pickup_address }} → {{ store.selectedTrip.destination_address }}</div>
        <div class="text-xs text-gray-500">Tarifa: S/ {{ Number(store.selectedTrip.estimated_fare).toFixed(2) }}</div>
        <div class="text-xs text-gray-500">Asientos: {{ store.selectedTrip.reserved_seats }}/{{ store.selectedTrip.max_passengers }}</div>
      </div>
      <div class="mb-3">
        <b>Conductor:</b>
      </div>
      <form @submit.prevent="handleReserve" class="flex flex-col gap-2">
        <label class="font-semibold">Punto de recojo</label>
        <div class="flex gap-2">
          <input
            class="flex-1 border rounded-lg p-2"
            type="text"
            :value="store.pickup?.address || ''"
            placeholder="Toca el mini-mapa o usa tu ubicación"
            readonly
          />
          <button type="button" class="text-blue-700 px-2 py-1" @click="useCurrentLocation">Mi ubicación</button>
        </div>
        <label class="font-semibold">Notas al conductor</label>
        <textarea v-model="store.notes" class="border rounded-lg p-2" placeholder="Referencia, punto, etc." />
        <label class="font-semibold">WhatsApp</label>
        <input v-model="store.whatsapp" class="border rounded-lg p-2" type="text" placeholder="Número WhatsApp" />
        <button class="btn btn-primary mt-2" :disabled="store.loading || !store.pickup">
          {{ store.loading ? 'Reservando...' : 'Reservar asiento' }}
        </button>
      </form>
      <div v-if="store.reservation" class="text-green-700 text-center mt-4">
        ¡Reserva realizada! Espera confirmación del conductor.
      </div>
      <div v-if="store.error" class="text-red-700 text-xs mt-2">
        {{ store.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import DetailMiniMap from './DetailMiniMap.vue';
import Swal from 'sweetalert2';
const store = useCollectiveRequestStore();

async function useCurrentLocation() {
 if (!navigator.geolocation) {
  await Swal.fire({
    icon: 'warning',
    title: 'Geolocalización no soportada',
    text: 'Tu navegador no soporta la función de geolocalización.',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#6366f1'
  });
  return;
}
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
    );
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const geocoder = new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });
    const address = results[0]?.formatted_address || 'Mi ubicación actual';
    store.setPickup({ coordinates: { latitude: lat, longitude: lng }, address });
  } catch {
    Swal.fire({
  icon: 'error',
  title: 'Ubicación no disponible',
  text: 'No se pudo obtener tu ubicación. Por favor, verifica los permisos de GPS e intenta nuevamente.',
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#06b6d4'
});
  }
}

async function handleReserve() {
  await store.reserveSeat();
}
</script>
