<script setup lang="ts">
import type { TripRequest } from '../types';
import { defineProps } from 'vue';
import { useTripRequestsStore } from '../stores/useTripRequestsStore';
import { useGeolocation } from '@/lib/composables/useGeolocation';
import Swal from 'sweetalert2';
const props = defineProps<{ trip: TripRequest }>();

/* Store + GPS */
const store = useTripRequestsStore();
const { position, error: geoError } = useGeolocation();

/* Acciones */
function openDetails() {
  store.openDrawer(props.trip);             // ← selecciona y muestra detalle
}

async function sendOffer(price: number) {
  if (await geoErrCheck()) return;

  store.postulate(props.trip, price, {
    latitude:  position.value!.latitude,
    longitude: position.value!.longitude,
  });
  store.closeDrawer();
}

function rejectRequest() {
  store.rejectRequest(props.trip.id);
  store.closeDrawer();
}



/* Valida GPS/errores con SweetAlert2 */
async function geoErrCheck(): Promise<boolean> {
  if (geoError.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Error de GPS',
      text: `⚠️ GPS: ${geoError.value}`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f59e42',
    });
    return true;
  }
  if (!position.value) {
    await Swal.fire({
      icon: 'info',
      title: 'Ubicación requerida',
      text: '⌛ Obteniendo ubicación…',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#38bdf8',
    });
    return true;
  }
  return false;
}

</script>

<template>
  <!-- Tarjeta compacta estilo chat -->
  <div
    class="bg-white rounded-lg shadow p-4 mb-3 cursor-pointer hover:bg-gray-50"
    @click="openDetails"
  >
    <div class="flex justify-between items-center mb-1">
      <span class="font-semibold">{{ trip.passenger_name }}</span>
      <span class="text-xs text-gray-400">{{ trip.service_type }}</span>
    </div>

    <p class="text-sm text-gray-600 truncate">
      {{ trip.pickup_address }} ➜ {{ trip.destination_address }}
    </p>

    <div class="text-xs text-gray-500 mt-1 flex gap-4">
      <span>💵 S/ {{ trip.passenger_max_fare }}</span>
    
      <span>⏱ {{ trip.estimated_duration }} min</span>
    </div>
  </div>
</template>
