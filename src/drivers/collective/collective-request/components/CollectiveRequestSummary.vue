<template>
  <div v-if="store.createdTrip" class="bg-white shadow rounded-xl p-4 mt-4">
    <h2 class="font-bold mb-2 text-sky-700">Viaje colectivo publicado</h2>
    <div>Ruta: {{ store.createdTrip.pickup_address }} → {{ store.createdTrip.destination_address }}</div>
    <div v-if="store.createdTrip.pickup_time">Salida: {{ new Date(store.createdTrip.pickup_time).toLocaleString() }}</div>
    <div>Capacidad: {{ store.createdTrip.max_passengers }} personas</div>
    <div v-if="store.createdTrip.estimated_fare">Tarifa por pasajero: S/ {{ store.createdTrip.estimated_fare }}</div>
    <div v-if="store.createdTrip.notes">Notas: {{ store.createdTrip.notes }}</div>
  </div>
</template>

<script setup lang="ts">
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
const store = useCollectiveRequestStore();
</script>
