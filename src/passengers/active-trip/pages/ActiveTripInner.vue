<template>
  <div v-if="!initialized" class="p-4">Buscando viaje activo…</div>

  <div
    v-else-if="trip"
    class="p-4 space-y-4"
    :style="{ paddingTop: '30px' }"
  >
    <DriverTracker />
    <TripStatus />
    <RateDriverModal />
  
    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';

import TripStatus from '../components/TripStatus.vue';
import DriverTracker from '../components/DriverTracker.vue';
import RateDriverModal from '../components/RateDriverModal.vue';

const router = useRouter();
const store = useActiveTripStore();

const trip = computed(() => store.trip);
const initialized = computed(() => store.initialized);

onMounted(async () => {
  await store.fetchActiveTrip();
  store.initWatcher();

  watch(
    () => store.trip,
    (val) => {
      if (store.initialized && val === null) {
        router.replace('/passenger/trip-request');
      }
    },
    { immediate: true }
  );
});
</script>
