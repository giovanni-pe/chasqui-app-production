<!-- src/drivers/active-trip/components/TripNavigation.vue -->
<template>
  <div v-if="trip" class="space-y-4">
    <!-- Estado del viaje con indicador visual -->
    <div class="bg-white rounded-xl p-3 border border-gray-100">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Estado del viaje:</span>
        <div class="flex items-center space-x-2">
          <div :class="getStatusColor(trip.trip_status)" class="w-2 h-2 rounded-full"></div>
          <span class="font-semibold text-gray-800">{{ getStatusText(trip.trip_status) }}</span>
        </div>
      </div>
    </div>

    <!-- Botones de acción según el estado -->
    <div class="space-y-3">
      <!-- Ir al punto de recojo -->
      <button
        v-if="trip.trip_status === 'accepted'"
        :disabled="loading"
        :class="[
          'w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2',
          loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02] shadow-sm'
        ]"
        @click="() => updateStatus('en_route')"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
        <span>{{ loading ? 'Actualizando...' : 'Ir al punto de recojo' }}</span>
      </button>

      <!-- Llegué al punto de recojo -->
      <button
        v-else-if="trip.trip_status === 'en_route'"
        :disabled="loading"
        :class="[
          'w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2',
          loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-[1.02] shadow-sm'
        ]"
        @click="() => updateStatus('arrived')"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>{{ loading ? 'Actualizando...' : 'Llegué al punto de recojo' }}</span>
      </button>

      <!-- Iniciar viaje -->
      <button
        v-else-if="trip.trip_status === 'arrived'"
        :disabled="loading"
        :class="[
          'w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2',
          loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-[1.02] shadow-sm'
        ]"
        @click="() => updateStatus('in_progress')"
      >
        <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M16 10h.01M9 16h.01M16 16h.01M12 6V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2m8 0V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h2"/>
        </svg>
        <span>{{ loading ? 'Actualizando...' : 'Iniciar viaje' }}</span>
      </button>
    </div>

    <!-- Estados finales -->
    <div v-if="trip.trip_status === 'completed'" class="bg-green-50 border border-green-200 rounded-xl p-4">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-green-700 font-semibold">¡Viaje completado!</span>
      </div>
    </div>

    <div v-else-if="trip.trip_status === 'cancelled'" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-red-700 font-semibold">Viaje cancelado</span>
      </div>
    </div>

    <!-- Indicador de progreso -->
    <div v-if="showProgressIndicator" class="bg-gray-50 rounded-xl p-3">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Progreso del viaje</span>
        <span>{{ getProgressPercentage() }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-500 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${getProgressPercentage()}%` }"
        ></div>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        {{ getProgressText() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits } from 'vue';
import { useDriverTripStore } from '@/drivers/active-trip/stores/useDriverTripStore';

const store = useDriverTripStore();
const trip = computed(() => store.trip);
const loading = computed(() => store.loading);
const updateStatus = store.updateStatus;

// Funciones para el estado visual
const getStatusColor = (status: string) => {
  const colors = {
    'accepted': 'bg-blue-500',
    'en_route': 'bg-orange-500',
    'arrived': 'bg-purple-500',
    'in_progress': 'bg-green-500',
    'completed': 'bg-green-600',
    'cancelled': 'bg-red-500'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-400';
};

const getStatusText = (status: string) => {
  const texts = {
    'accepted': 'Aceptado',
    'en_route': 'En camino',
    'arrived': 'En punto de recojo',
    'in_progress': 'En viaje',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };
  return texts[status as keyof typeof texts] || status;
};

const showProgressIndicator = computed(() => {
  return trip.value && ['accepted', 'en_route', 'arrived', 'in_progress'].includes(trip.value.trip_status);
});

const getProgressPercentage = () => {
  if (!trip.value) return 0;
  const progressMap = {
    'accepted': 25,
    'en_route': 50,
    'arrived': 75,
    'in_progress': 90,
    'completed': 100
  };
  return progressMap[trip.value.trip_status as keyof typeof progressMap] || 0;
};

const getProgressText = () => {
  if (!trip.value) return '';
  const textMap = {
    'accepted': 'Viaje aceptado, dirígete al punto de recojo',
    'en_route': 'En camino al punto de recojo',
    'arrived': 'Esperando al pasajero',
    'in_progress': 'Viaje en progreso'
  };
  return textMap[trip.value.trip_status as keyof typeof textMap] || '';
};

// Emit para comunicación con componente padre
const emit = defineEmits(['finalizar']);
function emitFinalizar() {
  emit('finalizar');
}
</script>