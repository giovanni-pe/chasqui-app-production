<template>
  <div v-if="loading || !stats" class="p-4 text-center text-yellow-700">
    Cargando estadísticas...
  </div>

  <div
    v-else
    class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/70 backdrop-blur-xl border border-yellow-100/30 rounded-2xl shadow-inner"
  >
    <div class="rounded-xl p-4 flex flex-col items-start gap-1 bg-gradient-to-br from-yellow-50 to-white shadow">
      <Icon icon="mdi:cash" class="text-yellow-600 text-2xl" />
      <span class="text-xs text-gray-500">Ganancias Hoy</span>
      <span class="text-xl font-bold text-yellow-800">S/ {{ stats.today_earnings.toFixed(2) }}</span>
    </div>

    <div class="rounded-xl p-4 flex flex-col items-start gap-1 bg-gradient-to-br from-emerald-50 to-white shadow">
      <Icon icon="mdi:car-multiple" class="text-emerald-600 text-2xl" />
      <span class="text-xs text-gray-500">Viajes Hoy</span>
      <span class="text-xl font-bold text-emerald-800">{{ stats.today_trips }}</span>
    </div>

    <div class="rounded-xl p-4 flex flex-col items-start gap-1 bg-gradient-to-br from-yellow-100 to-white shadow">
      <Icon icon="mdi:calendar-week" class="text-yellow-600 text-2xl" />
      <span class="text-xs text-gray-500">Ganancias Semana</span>
      <span class="text-xl font-bold text-yellow-800">S/ {{ Number(stats.week_earnings).toFixed(2) }}</span>
    </div>

    <div class="rounded-xl p-4 flex flex-col items-start gap-1 bg-gradient-to-br from-pink-50 to-white shadow">
      <Icon icon="mdi:calendar-month" class="text-fuchsia-600 text-2xl" />
      <span class="text-xs text-gray-500">Ganancias Mes</span>
      <span class="text-xl font-bold text-fuchsia-800">S/ {{ Number(stats.month_earnings).toFixed(2) }}</span>
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
