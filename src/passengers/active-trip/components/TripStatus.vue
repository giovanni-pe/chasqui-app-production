<template>
  <div v-if="trip" class="glass-card animate-fade-in">
    <!-- Encabezado -->
    <div class="flex items-center gap-2 text-sky-600 mb-2">
      <Icon icon="mdi:map-marker-path" class="text-lg" />
      <h2 class="text-sm font-semibold">Viaje activo</h2>
      <span class="badge-status ml-auto">
        <Icon icon="mdi:clock-outline" class="text-xs" />
        {{ trip.status }}
      </span>
    </div>

    <!-- Info del viaje -->
    <div class="space-y-1 text-xs text-gray-700">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:map-marker" class="text-sky-600 text-sm" />
        <span class="truncate">{{ trip.pickup.address }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon icon="mdi:flag-checkered" class="text-green-600 text-sm" />
        <span class="truncate">{{ trip.destination.address }}</span>
      </div>

      <!-- Precio + Publisher en una sola fila -->
      
      <!-- PricesBadge.vue -->
<div
  class="flex items-center gap-3 px-3 py-1 rounded-2xl backdrop-blur-sm bg-white/30 shadow-inner ring-1 ring-white/40"
>
  <!-- Estimado -->
  <div class="flex items-center gap-1 text-[13px] leading-none">
    <Icon icon="mdi:calculator-variant-outline" class="w-4 h-4 text-sky-600" />
    <span class="text-gray-500">Est.</span>
    <span class="font-semibold text-sky-600">S/ {{ trip.estimatedFare.toFixed(2) }}</span>
  </div>

  <!-- Separador sutil -->
  <div class="h-4 w-px bg-gray-300/60"></div>

  <!-- Oferta del pasajero -->
  <div class="flex items-center gap-1 text-[13px] leading-none">
    <Icon icon="mdi:hand-coin-outline" class="w-4 h-4 text-yellow-500" />
    <span class="text-gray-500">Máx Ofre.</span>
    <span class="font-semibold text-yellow-600">S/ {{ trip.passenger_max_fare.toFixed(2) }}</span>
  </div>

  <!-- Publicar a conductores -->
  <TripPublisher
    v-if="trip.status === 'pending'"
    class="ml-auto scale-90 sm:scale-100"  
  />
</div>

    </div>

    <!-- Info del conductor -->
    <div v-if="trip.driver" class="border-t pt-2 mt-2 space-y-1 text-xs text-gray-800">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:steering" class="text-amber-600 text-sm" />
        <span>{{ trip.driver.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon icon="mdi:star" class="text-yellow-500 text-sm" />
        <span>{{ trip.driver.rating }}</span>
      </div>
    </div>

    <!-- Botón cancelar -->
    <button
      v-if="trip.status !== 'completed' && trip.status !== 'cancelled'"
      @click="store.cancelTrip"
      class="btn-red w-full mt-4"
    >
      <Icon icon="mdi:cancel" class="inline-block mr-1 -mt-1" />
      Cancelar viaje
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';
import TripPublisher from './TripPublisher.vue';

const store = useActiveTripStore();
const trip = computed(() => store.trip);
</script>

<style scoped>
.glass-card {
  @apply bg-white/80 backdrop-blur-xl border border-white/30 shadow-md rounded-2xl p-4 w-full;
}
.badge-status {
  @apply bg-sky-100 text-sky-700 text-[10px] px-2 py-1 rounded-full font-medium flex items-center gap-1;
}
.btn-red {
  @apply bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-transform duration-200 hover:scale-105 text-xs font-medium;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
