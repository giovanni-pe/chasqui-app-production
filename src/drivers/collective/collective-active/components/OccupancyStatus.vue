<template>
  <div class="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow font-semibold text-blue-700 mb-2">
    <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M7 10a4 4 0 118 0M15 21H9" />
    </svg>
    <span>
      Ocupación: {{ store.occupancy }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';
const store = useCollectiveActiveStore();
</script>
