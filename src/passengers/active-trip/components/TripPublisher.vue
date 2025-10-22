<template>
  <div class="badge-card relative">
    <!-- Ícono con pulso si no publicado -->
    <div class="flex items-center gap-2 text-gray-700 text-xs font-medium">
      <div class="relative">
        <div
          v-if="!published"
          class="absolute inset-0 rounded-full bg-green-400 opacity-50 animate-ping"
        ></div>
        <Icon icon="mdi:access-point-network" class="text-green-600 text-lg relative z-10" />
      </div>
      <span>ChasquiX</span>
    </div>

    <!-- Botón -->
    <button
      @click="publishTrip"
      :disabled="!trip || published"
      :class="published ? 'btn-disabled' : 'btn-green-sm'"
      class="mt-1 w-full"
    >
      <Icon icon="mdi:transit-connection" class="inline-block mr-1 -mt-1" />
      {{ published ? 'Publicado' : 'Publicar' }}
    </button>

    <p v-if="error" class="text-[10px] text-red-600 mt-1">⚠️ {{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';
import { useAuthStore } from '@/auth/stores/auth';
import { mqttService } from '@/lib/mqtt';

const store = useActiveTripStore();
const auth = useAuthStore();
const trip = computed(() => store.trip);

const published = ref(false);
const error = ref<string | null>(null);

function publishTrip() {
  if (!trip.value || !auth.user) {
    error.value = 'No se puede publicar sin viaje activo o sesión.';
    return;
  }

  try {
    const payload = {
      trip_id: trip.value.id,
      trip_code: `TRIP-${trip.value.id}`,
      passenger_id: auth.user.id,
      passenger_name: auth.user.name,
      pickup: trip.value.pickup,
      destination: trip.value.destination,
      service_type_id: trip.value.serviceType.id,
      estimated_fare: trip.value.estimatedFare,
      created_at: new Date().toISOString(),
    };

    mqttService.publish('chasqui/trip_requests', payload);
    published.value = true;
    error.value = null;
  } catch (e) {
    error.value = 'Error al publicar por MQTT';
    console.error('[MQTT publish error]', e);
  }
}
</script>

<style scoped>
.badge-card {
  @apply bg-white/70 border border-white/30 backdrop-blur-md px-3 py-2 rounded-lg shadow-inner w-max;
}
.btn-green-sm {
  @apply bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition;
}
.btn-disabled {
  @apply bg-gray-400 text-white px-3 py-1 rounded-md text-xs cursor-not-allowed;
}
</style>
