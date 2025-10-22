<template>
  <div class="bg-white rounded-xl shadow p-4">
    <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
      <Icon icon="mdi:chart-timeline-variant-shimmer" class="text-yellow-600 text-base" />
      Historial 30 días
    </div>
    <div class="relative h-[140px]">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js'
import { Line } from 'vue-chartjs'
import { Icon } from '@iconify/vue'
import type { EarningsRecord } from '../types'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)

const props = defineProps<{ data: EarningsRecord[] }>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.date),
  datasets: [
    {
      label: 'Ganancias',
      data: props.data.map(d => d.earnings),
      fill: true,
      backgroundColor: 'rgba(191, 219, 254, 0.3)',
      borderColor: '#38bdf8',
      borderWidth: 1.5,
      tension: 0.4,
      pointRadius: 1,
      pointHoverRadius: 4,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: { font: { size: 9 }, color: '#94a3b8' },
      grid: { display: false }
    },
    y: {
      ticks: { font: { size: 9 }, color: '#94a3b8' },
      grid: { color: '#fcd34d20' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `S/ ${ctx.raw.toFixed(2)}`
      }
    }
  }
}

const LineChart = Line
</script>
