<!-- src/passengers/trip-request/pages/RequestTripPage.vue -->
<template>
  <div class="relative w-full h-screen bg-gray-100 overflow-hidden">
    <!-- Botón de salida -->
    <button
      @click="handleExit"
      class="absolute top-4 left-4 z-30 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
      title="Volver al dashboard"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
    <SidebarForm />

    <MapView />

    <!-- Instrucción flotante -->
    <div v-if="!store.activeSelection" class="absolute bottom-24 md:bottom-4 left-4 right-4 md:hidden bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-center transition-opacity duration-300">
      <p class="text-sm text-gray-700">
        💡 <strong>Tip:</strong> Usa "Mi ubicación" o toca el mapa para seleccionar puntos.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTripRequestStore } from '@/passengers/trip-request/stores/useTripRequestStore';
import SidebarForm from '../components/SidebarForm.vue';
import MapView from '../components/MapView.vue';

const router = useRouter();
const store = useTripRequestStore();

function handleExit() {
  store.setActiveSelection(null);
  router.push('/dashboard');
}

// CAMBIO: Controlar el overflow del body de la página
onMounted(() => {
  // Cuando el componente se monta, bloqueamos el scroll del body
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  // Cuando el componente se destruye (al salir de la página), restauramos el scroll.
  // ¡ESTO ES MUY IMPORTANTE para no afectar al resto de la app!
  document.body.style.overflow = 'auto';
});
</script>
