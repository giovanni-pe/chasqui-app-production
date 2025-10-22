<template>
  <div v-if="trip" class="bg-white rounded-xl shadow p-4 mb-4">
    <div class="font-semibold text-lg mb-2">Viaje colectivo</div>
    <div class="text-sm">
      <div>Origen: <span class="font-semibold">{{ trip.pickup_address }}</span></div>
      <div>Destino: <span class="font-semibold">{{ trip.destination_address }}</span></div>
      <div>Conductor: <span class="font-semibold">{{ trip.driver?.name }}</span></div>
      <div>Vehículo: <span class="font-semibold">{{ trip.vehicle?.model }} ({{ trip.vehicle?.plate }})</span></div>
    </div>
    <div class="text-xs text-gray-400 mt-1">
      Código de viaje: {{ trip.trip_code }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';

const store = useCollectiveActiveStore();
const trip = computed(() => store.trip);
</script>

