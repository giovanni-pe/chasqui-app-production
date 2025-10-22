<template>
  <div class="z-10 mb-4">
    <!-- Contenedor con scroll lateral -->
    <div class="relative overflow-x-auto no-scrollbar scroll-smooth px-1 py-2">
      <div class="flex space-x-3 min-w-max">
        <button
          v-for="f in filters"
          :key="f.value"
          @click="store.setStatusFilter(f.value)"
          :class="[
            'relative flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ease-out shadow-sm',
            store.statusFilter === f.value
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white scale-105 shadow-lg'
              : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md'
          ]"
        >
          <Icon
            :icon="f.icon"
            class="w-4 h-4 transition-transform duration-300"
            :class="store.statusFilter === f.value ? 'scale-110' : 'group-hover:scale-105'"
          />
          <span>{{ f.label }}</span>

          <span
            v-if="store.statusFilter === f.value"
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/60 rounded-full animate-pulse"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useTripHistoryStore } from '../store/useTripHistoryStore'

const store = useTripHistoryStore()

const filters = [
  { label: 'Todos',           icon: 'mdi:format-list-bulleted',   value: '' },
  { label: 'Completados',     icon: 'mdi:check-circle-outline',   value: 'completed' },
  { label: 'Por ti',          icon: 'mdi:cancel',                 value: 'cancelled_by_passenger' },
  { label: 'Por conductor',   icon: 'mdi:account-off-outline',    value: 'cancelled_by_driver' },
  { label: 'Por sistema',     icon: 'mdi:server-off-outline',     value: 'cancelled_by_system' },
] as const
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
