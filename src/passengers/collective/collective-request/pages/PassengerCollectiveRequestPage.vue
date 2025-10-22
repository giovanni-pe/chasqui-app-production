<template>
  <div class="relative w-full h-screen bg-gray-100 overflow-hidden">
    <!-- Botón de regreso -->
    <button
      @click="handleExit"
      class="absolute top-4 left-4 z-40 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
      title="Volver al inicio"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>

    <!-- Mapa principal con todos los colectivos -->
    <CollectiveMapView />

    <!-- Lista de colectivos, solo visible si no hay detalle abierto -->
    <CollectiveTripList v-if="!store.showDetail" />

    <!-- Panel de detalle y reserva, controlado por el store -->
    <CollectiveTripDetail v-if="store.showDetail" />

    <!-- Mensaje de error global -->
    <div v-if="store.error" class="absolute top-16 left-4 right-4 bg-red-50 border border-red-200 p-2 rounded shadow z-50">
      <span class="text-red-700">{{ store.error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import CollectiveMapView from '../components/CollectiveMapView.vue';
import CollectiveTripList from '../components/CollectiveTripList.vue';
import CollectiveTripDetail from '../components/CollectiveTripDetail.vue';

const store = useCollectiveRequestStore();
const router = useRouter();

function handleExit() {
  store.reset();
  router.push('/dashboard'); // Ajusta si tu dashboard tiene otra ruta
}

onMounted(() => {
  document.body.style.overflow = 'hidden';
  store.fetchAvailableTrips();
});
onUnmounted(() => {
  document.body.style.overflow = 'auto';
});
</script>
