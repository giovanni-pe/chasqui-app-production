<template>
  <div class="p-4 space-y-4 bg-gray-100 min-h-screen">
    <OccupancyStatus />
    <ActiveTripMap />
    <PassengerPanel />
    <TripActions />
  </div>
</template>

<script setup lang="ts">
import OccupancyStatus from '../components/OccupancyStatus.vue';
import ActiveTripMap from '../components/ActiveTripMap.vue';
import PassengerPanel from '../components/PassengerPanel.vue';
import TripActions from '../components/TripActions.vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';

const store = useCollectiveActiveStore();
import { onMounted } from 'vue';
onMounted(() => {
  store.fetchActiveTrip();
});
</script>
