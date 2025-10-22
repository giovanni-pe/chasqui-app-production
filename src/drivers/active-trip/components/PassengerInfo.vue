<!-- src/drivers/active-trip/components/PassengerInfo.vue -->
<template>
  <div v-if="trip" class="bg-white shadow rounded-xl p-4 mb-4">
    <div class="text-gray-600 font-bold mb-1">Pasajero sdf</div>
    <div class="text-lg font-semibold">{{ trip.passenger_name }}</div>
    <div class="text-sm text-gray-500">Destino: {{ trip.destination_address }}</div>
    <!-- Aquí puedes agregar teléfono, rating, etc. -->
  </div>
</template>

<script setup lang="ts">
import { useDriverTripStore } from '@/drivers/active-trip/stores/useDriverTripStore';

const store = useDriverTripStore();
const trip = store.trip;
</script>
