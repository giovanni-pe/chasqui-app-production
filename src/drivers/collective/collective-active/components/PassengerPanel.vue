<template>
  <div class="bg-white rounded-xl shadow p-4">
    <h2 class="font-bold text-lg mb-4">Pasajeros</h2>
    <ul v-if="store.passengers.length > 0">
      <li v-for="p in store.passengers" :key="p.id"
          class="flex items-center gap-2 mb-1 p-2 rounded hover:bg-gray-50">
        <span class="w-7 h-7 flex items-center justify-center rounded-full font-bold"
          :class="{
            'bg-blue-200 text-blue-700': p.status === 'reserved',
            'bg-green-200 text-green-700': p.status === 'aboard',
            'bg-gray-200 text-gray-500': p.status === 'dropped' || p.status === 'cancelled'
          }"
        >{{ p.name[0] }}</span>
        <span class="flex-1 font-medium">{{ p.name }}</span>
        <span class="text-xs uppercase"
          :class="{
            'text-blue-600': p.status === 'reserved',
            'text-green-600': p.status === 'aboard',
            'text-gray-600': p.status === 'dropped' || p.status === 'cancelled'
          }"
        >{{ statusText(p.status) }}</span>
        <!-- Botón de mapa para centrar y resaltar pasajero -->
        <button
          class="ml-2 text-sky-600 hover:text-sky-900 transition"
          @click="goToPassenger(p)"
          title="Ver ubicación en mapa"
        >
          <Icon icon="mdi:map-marker-radius" class="w-5 h-5" />
        </button>
        <button
          v-if="p.status === 'reserved'"
          @click="store.markPassengerAboard(p.id)"
          class="btn btn-xs btn-primary"
        >A bordo</button>
        <button
          v-if="p.status === 'aboard'"
          @click="store.markPassengerDropped(p.id)"
          class="btn btn-xs btn-warning"
        >Bajó</button>
      </li>
    </ul>
    <div v-else class="text-gray-500 text-center py-4">
      No hay pasajeros aún.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';
import { onMounted } from 'vue';
import { Icon } from '@iconify/vue';
const store = useCollectiveActiveStore();

function statusText(status: string) {
  switch (status) {
    case 'reserved': return 'Reservado';
    case 'aboard': return 'A bordo';
    case 'dropped': return 'Bajó';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
}

// Resalta y centra en el pasajero al hacer click
function goToPassenger(p: any) {
  store.focusPassenger(p.id, Number(p.pickup_latitude), Number(p.pickup_longitude), 17);
}

onMounted(() => {
  store.refreshPassengers();
});
</script>
