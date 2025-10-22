<template>
  <div class="p-2 max-w-2xl mx-auto">
    <CollectiveTripSummary />
    <CollectiveActiveMap />
    <MyStatusPanel />
    <div v-if="store.error" class="text-red-700 mt-3">{{ store.error }}</div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';
import CollectiveTripSummary from '../components/CollectiveTripSummary.vue';
import CollectiveActiveMap from '../components/CollectiveActiveMap.vue';
import MyStatusPanel from '../components/MyStatusPanel.vue';

const store = useCollectiveActiveStore();

onMounted(() => {
  store.fetchActiveTrip();
});
</script>
