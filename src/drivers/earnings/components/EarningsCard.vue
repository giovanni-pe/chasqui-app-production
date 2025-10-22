<template>
  <div class="bg-gradient-to-br from-white via-yellow-50 to-slate-50 rounded-2xl p-5 shadow-xl grid grid-cols-2 gap-4 text-sm">
    <!-- Ganancias totales -->
    <div class="flex items-start gap-3">
      <Icon icon="mdi:wallet" class="text-green-600 text-3xl" />
      <div>
        <div class="text-xl font-bold text-green-700">S/ {{ summary.total_earnings.toFixed(2) }}</div>
        <div class="text-gray-500">Ganancias totales</div>
      </div>
    </div>

    <!-- Viajes completados -->
    <div class="flex items-start gap-3">
      <Icon icon="mdi:check-circle-outline" class="text-yellow-600 text-3xl" />
      <div>
        <div class="text-xl font-bold">{{ summary.total_trips }}</div>
        <div class="text-gray-500">Viajes completados</div>
      </div>
    </div>

    <!-- Ganancias hoy -->
    <div class="flex items-start gap-3">
      <Icon icon="mdi:calendar-today" class="text-blue-600 text-2xl" />
      <div>
        <div class="text-lg font-semibold text-blue-700">S/ {{ summary.today_earnings.toFixed(2) }}</div>
        <div class="text-gray-500">Ganado hoy</div>
      </div>
    </div>

    <!-- Últimos 7 días -->
    <div class="flex items-start gap-3">
      <Icon icon="mdi:calendar-week" class="text-indigo-600 text-2xl" />
      <div>
        <div class="text-lg font-semibold text-indigo-700">S/ {{ summary.last_week_earnings.toFixed(2) }}</div>
        <div class="text-gray-500">Últimos 7 días</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EarningsSummary } from '../types'
import { Icon } from '@iconify/vue'

defineProps<{
  summary: EarningsSummary
}>()
</script>
