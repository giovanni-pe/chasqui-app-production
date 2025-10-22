<template>
  <div class="absolute top-20 right-4 w-96 max-w-full z-40 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[80vh]">
    <h2 class="text-lg font-semibold text-[#22477D] mb-3">
      Colectivos disponibles cerca
    </h2>
    <div v-if="store.trips.length === 0" class="text-gray-500 text-center py-6">
      No hay colectivos activos en tu zona.
    </div>
    <div
      v-for="trip in store.trips"
      :key="trip.id"
      class="mb-3 border rounded-lg shadow-sm p-3 hover:ring-2 hover:ring-sky-600 cursor-pointer transition-all"
      @click="store.setSelectedTrip(trip)"
      :class="store.selectedTrip?.id === trip.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white'"
    >
      <div class="flex justify-between items-center">
        <span class="font-semibold text-sky-700">
          <span class="inline-block px-2 py-1 bg-yellow-200 rounded mr-2">{{ trip.trip_code }}</span>
          {{ trip.pickup_address }} → {{ trip.destination_address }}
        </span>
        <span class="text-xs bg-sky-100 px-2 py-1 rounded">
          {{ trip.reserved_seats }}/{{ trip.max_passengers }} asientos
        </span>
      </div>
      <div class="flex justify-between mt-1 text-sm text-gray-600">
        <span>
          Conductor: <b>{{  }}</b>
        </span>
        <span>
          <i class="mdi mdi-car"></i> 
        </span>
      </div>
      <div class="flex justify-between mt-1 text-sm text-gray-700">
        <span>Tarifa estimada: <b>S/ {{ Number(trip.estimated_fare).toFixed(2) }}</b></span>
        <span class="text-xs">Estado: {{ trip.status }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
const store = useCollectiveRequestStore();
</script>
