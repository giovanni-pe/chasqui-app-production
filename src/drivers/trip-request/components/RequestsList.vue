<script setup lang="ts">
import { watch, computed, onMounted, onUnmounted } from 'vue';
import { useTripRequestsStore } from '../stores/useTripRequestsStore';
import { useGeolocation } from '@/lib/composables/useGeolocation';
import RequestCard from './RequestCard.vue';
import TripRequestDetails from './TripRequestDetails.vue';
import TripRequestsMap from './TripRequestsMap.vue';

const store = useTripRequestsStore();
const { position, error: geoError } = useGeolocation();
const requests = computed(() => store.sortedRequests);

let started = false;

function initListener(lat?: number, lng?: number) {
  if (started) return;
  store.startTripRequestsMqtt(lat, lng);
  started = true;
}

function reloadPage() {
  window.location.reload();
}

onMounted(() => {
  if (position.value) {
    store.fetchRequests(position.value.latitude, position.value.longitude);
    initListener(position.value.latitude, position.value.longitude);
  }
});

watch(position, (pos) => {
  if (!pos) return;
  store.fetchRequests(pos.latitude, pos.longitude);
  initListener(pos.latitude, pos.longitude);
}, { immediate: true });

onUnmounted(() => {
  store.stopTripRequestsMqtt();
});
</script>

<template>
  <div>
    <!-- ERROR GEO -->
    <div
      v-if="geoError"
      class="bg-yellow-100 text-yellow-800 p-4 rounded-lg my-4 shadow-md flex flex-col items-center"
    >
      <div class="font-bold text-lg mb-2">¡Activa la ubicación para recibir viajes!</div>
      <div class="mb-2">{{ geoError }}</div>
      <ul class="text-sm text-gray-700 list-disc list-inside mb-3">
        <li>Verifica que el GPS esté encendido.</li>
        <li>Otorga permisos de ubicación a la app o navegador.</li>
        @click="reloadPage"
      </ul>
      <button
        class="px-4 py-2 rounded bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
        @click="reloadPage()"
      >
        Reintentar
      </button>
    </div>

    <!-- LOADING inicial -->
    <div v-else-if="store.loading && store.requests.length === 0">
      ⏳ Cargando solicitudes...
    </div>

    <!-- ERROR backend -->
    <div v-else-if="store.hasError" class="text-red-600">
      ❌ {{ store.error }}
    </div>

    <!-- SIN solicitudes -->
    <div v-else-if="!store.requests.length" class="text-gray-400">
      ℹ️ No hay solicitudes de viaje disponibles.
    </div>

    <!-- MAPA + LISTA -->
    <div v-else class="space-y-4">
      <TripRequestsMap />

      <p class="text-sm text-green-700">
        ✅ Renderizando {{ requests.length }} solicitud(es)
      </p>
      <RequestCard
        v-for="req in requests"
        :key="req.id"
        :trip="req"
      />
    </div>

    <TripRequestDetails />
  </div>
</template>
