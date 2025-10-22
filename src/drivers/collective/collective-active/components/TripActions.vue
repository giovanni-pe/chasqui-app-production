<template>
  <div class="my-4 p-3 bg-white rounded-lg shadow-sm max-w-md mx-auto">
    <!-- Barra de progreso estilo batería -->
    <div class="relative mb-3">
      <div class="flex items-center gap-2">
        <!-- Icono de batería -->
        <div class="relative">
          <div class="w-8 h-5 border-2 border-gray-300 rounded-sm bg-white relative">
            <!-- Relleno de la batería -->
            <div 
              :class="[
                'h-full rounded-sm transition-all duration-500 ease-out',
                progressPercentage <= 25 ? 'bg-red-500' :
                progressPercentage <= 50 ? 'bg-yellow-500' :
                progressPercentage <= 75 ? 'bg-blue-500' : 'bg-green-500'
              ]"
              :style="{ width: progressPercentage + '%' }"
            ></div>
            <!-- Terminal de batería -->
            <div class="absolute -right-1 top-1 w-1 h-3 bg-gray-300 rounded-r-sm"></div>
          </div>
        </div>
        
        <!-- Porcentaje y estado -->
        <div class="flex-1 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            {{ progressPercentage }}%
          </span>
          <span 
            :class="[
              'text-xs px-2 py-1 rounded-full font-medium',
              store.tripStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              store.tripStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              store.tripStatus === 'completed' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            ]"
          >
            {{ statusText }}
          </span>
        </div>
      </div>
      
      <!-- Tooltip con detalles al hover -->
      <div 
        class="absolute bottom-full left-0 mb-2 w-full bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
        :class="'group-hover:opacity-100 group-hover:visible'"
      >
        <div class="flex justify-between text-center">
          <div v-for="(step, idx) in steps" :key="step.label" class="flex-1">
            <div 
              :class="[
                'w-2 h-2 rounded-full mx-auto mb-1',
                idx < store.progressStep ? 'bg-green-400' :
                idx === store.progressStep ? 'bg-blue-400' : 'bg-gray-500'
              ]"
            ></div>
            <div class="text-[10px] leading-tight">{{ step.label }}</div>
          </div>
        </div>
        <!-- Flecha del tooltip -->
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>

    <!-- Acción principal -->
    <div class="flex gap-2">
      <!-- Botón principal -->
      <button
        v-if="store.tripStatus === 'pending'"
        @click="handleStartTrip"
        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="store.completing"
      >
        <span v-if="store.completing" class="flex items-center justify-center gap-2">
          <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Iniciando...
        </span>
        <span v-else>🚀 Iniciar Viaje</span>
      </button>

      <button
        v-if="store.tripStatus === 'in_progress' && store.canCompleteTrip"
        @click="store.completeTrip"
        class="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="store.completing"
      >
        <span v-if="store.completing" class="flex items-center justify-center gap-2">
          <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Finalizando...
        </span>
        <span v-else>🏁 Finalizar Viaje</span>
      </button>

      <!-- Estado final compacto -->
      <div 
        v-if="store.tripStatus === 'completed'" 
        class="flex-1 text-center py-2 px-4 bg-green-50 text-green-700 text-sm font-medium rounded-md border border-green-200"
      >
        ✅ Completado
      </div>
      
      <div 
        v-if="store.tripStatus === 'cancelled_by_driver' || store.tripStatus === 'cancelled_by_passenger'" 
        class="flex-1 text-center py-2 px-4 bg-red-50 text-red-700 text-sm font-medium rounded-md border border-red-200"
      >
        ❌ Cancelado
      </div>
    </div>

    <!-- Error compacto -->
    <div v-if="store.error" class="mt-2 text-red-600 text-xs text-center bg-red-50 p-2 rounded-md border border-red-200">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';
import { collectiveActiveApi } from '../service/collectiveActiveApi';

const store = useCollectiveActiveStore();

// Pasos del flujo visual
const steps = [
  { label: 'Reservas' },
  { label: 'A bordo' },
  { label: 'En ruta' },
  { label: 'Finalizado' },
];

// Porcentaje de progreso basado en el paso actual
const progressPercentage = computed(() => {
  return Math.round((store.progressStep / (steps.length - 1)) * 100);
});

// Texto del estado actual
const statusText = computed(() => {
  switch (store.tripStatus) {
    case 'pending': return 'Esperando';
    case 'in_progress': return 'En progreso';
    case 'completed': return 'Completado';
    case 'cancelled_by_driver':
    case 'cancelled_by_passenger': return 'Cancelado';
    default: return 'Desconocido';
  }
});

// Acción para iniciar el viaje
async function handleStartTrip() {
  if (!store.trip || store.trip.status !== 'pending') return;
  store.completing = true;
  store.error = '';
  try {
    const resp = await collectiveActiveApi.startTrip(store.trip.id);
    store.trip = resp;
    await store.fetchActiveTrip();
  } catch (e) {
    store.error = (e as any).message || 'No se pudo iniciar el viaje';
  } finally {
    store.completing = false;
  }
}
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
.group:hover .group-hover\:visible {
  visibility: visible;
}
</style>