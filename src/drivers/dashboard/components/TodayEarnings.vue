<template>
  <div
    v-if="!loading && stats"
    class="mt-4 p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-green-100 shadow-sm space-y-3"
  >
    <div class="flex items-center gap-3 text-green-700">
      <Icon icon="mdi:cash" class="text-2xl" />
      <h2 class="text-xl font-bold">Hoy: S/ {{ stats.today_earnings }}</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-2">
      <div class="flex items-center gap-2">
        <Icon icon="mdi:car-multiple" class="text-lg text-green-500" />
        <span><strong>{{ stats.today_trips }}</strong> viajes</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon icon="mdi:clock-outline" class="text-lg text-green-500" />
        <span><strong>{{ stats.online_hours_today }}</strong> hrs online</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon icon="mdi:check-decagram" class="text-lg text-green-500" />
        <span>Aceptación: {{ stats.acceptance_rate }}%</span>
      </div>

      <div class="flex items-center gap-2">
        <Icon icon="mdi:check-circle-outline" class="text-lg text-green-500" />
        <span>Finalización: {{ stats.completion_rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDriverDashboardStore } from '../store/driverDashboardStore'
import { Icon } from '@iconify/vue'

const dashboardStore = useDriverDashboardStore()
const stats = computed(() => dashboardStore.stats!)
const loading = computed(() => dashboardStore.loading)
</script>
