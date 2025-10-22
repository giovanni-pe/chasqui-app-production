<!-- src/components/VehicleInfo.vue -->
<template>
  <div class="flex items-center gap-3 bg-blue-50/60 rounded-lg px-3 py-2 mt-1 shadow-inner">
    <Icon icon="mdi:car" class="text-sky-500 w-6 h-6" />
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-gray-800 truncate">
        {{ vehicle.brand || 'Vehículo' }}
        <span v-if="vehicle.model" class="text-gray-500 font-normal">({{ vehicle.model }})</span>
      </div>
      <div class="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600 mt-0.5">
        <span v-if="vehicle.license_plate" class="flex items-center gap-1">
          <Icon icon="mdi:card-account-details-outline" class="w-4 h-4 text-blue-400" />
          <span class="font-mono">{{ vehicle.license_plate }}</span>
        </span>
        <span v-if="vehicle.color" class="flex items-center gap-1">
          <Icon icon="mdi:palette" class="w-4 h-4 text-amber-500" />
          <span>{{ vehicle.color }}</span>
        </span>
        <span v-if="vehicle.capacity" class="flex items-center gap-1">
          <Icon icon="mdi:seat-passenger" class="w-4 h-4 text-green-500" />
          <span>{{ vehicle.capacity }} asientos</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const props = defineProps<{ vehicle: any }>();
</script>
