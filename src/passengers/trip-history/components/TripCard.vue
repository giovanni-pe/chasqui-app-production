<template>
  <Card
    hover
    class="relative overflow-hidden p-4 transition transform duration-200 ease-out"
    :class="[
      'cursor-pointer group',
      selected ? 'ring-2 ring-blue-500 scale-[1.01]' : 'hover:scale-[1.01]',
    ]"
    @click="handleClick"
  >
    <!-- Fondos decorativos -->
    <div class="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-2xl animate-float pointer-events-none" />
    <div class="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gradient-to-br from-violet-200/20 to-purple-200/20 blur-3xl pointer-events-none" />

    <!-- Ruta -->
    <div class="flex items-start gap-3 mb-3">
      <div class="flex flex-col items-center flex-shrink-0">
        <Icon icon="mdi:map-marker" class="w-5 h-5 text-blue-500" />
        <div class="w-px h-6 bg-gray-300 my-1" />
        <Icon icon="mdi:map-marker" class="w-5 h-5 text-red-500" />
      </div>
      <div class="flex-1 min-w-0 space-y-0.5">
        <p class="font-medium text-sm truncate">{{ trip.pickup_address }}</p>
        <p class="text-xs text-gray-500 truncate">{{ trip.destination_address }}</p>
      </div>
    </div>

    <!-- Estado y fecha -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1">
        <Icon :icon="status.icon" :class="`w-4 h-4 text-${status.variant}-600`" />
        <Badge :variant="status.variant" size="sm">{{ status.label }}</Badge>
      </div>
      <div class="flex items-center gap-1 text-xs text-gray-500">
        <Icon icon="mdi:clock-outline" class="w-4 h-4" />
        <span>{{ formattedDate }}</span>
      </div>
    </div>

    <!-- Detalles de servicio y tarifa -->
    <div class="flex items-center justify-between mb-3 text-xs">
      <div class="flex items-center gap-1 text-gray-600">
        <Icon icon="mdi:car-sports" class="w-4 h-4" />
        <span>{{ trip.service_type }}</span>
      </div>
      <div class="font-semibold text-gray-900">
        S/ {{ trip.final_fare ?? trip.estimated_fare }}
      </div>
    </div>

    <!-- Conductor y métricas -->
    <div
      v-if="trip.driver"
      class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs"
    >
      <div class="flex items-center gap-1 min-w-0">
        
      </div>
      <div class="flex items-center gap-1 text-yellow-500">
        <Icon icon="mdi:star" class="w-4 h-4" />
        <span class="text-gray-700">{{ trip.driver.rating_average?.toFixed(1) }}</span>
      </div>
    </div>

    <!-- Distancia y duración -->
    <div v-if="trip.distance_km && trip.duration_minutes" class="mt-2 text-xs text-gray-400">
      Distancia: {{ Number(trip.distance_km).toFixed(1) }} km • Duración: {{ trip.duration_minutes }} min
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Card from '@/ui/Card.vue'
import Badge from '@/ui/Badge.vue'
import type { TripHistoryItem } from '../types'

const props = defineProps<{
  trip: TripHistoryItem
  selected?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', trip: TripHistoryItem): void
}>()

const handleClick = () => emit('select', props.trip)

const STATUS_MAP = {
  completed: {
    label: 'Completado',
    icon: 'mdi:check-circle',
    variant: 'success',
  },
  cancelled_by_passenger: {
    label: 'Cancelado por ti',
    icon: 'mdi:account-cancel',
    variant: 'warning',
  },
  cancelled_by_driver: {
    label: 'Cancelado por conductor',
    icon: 'mdi:account-cancel',
    variant: 'danger',
  },
  cancelled_by_system: {
    label: 'Cancelado por sistema',
    icon: 'mdi:server-off',
    variant: 'secondary',
  },
} as const

const status = computed(() => {
  return STATUS_MAP[props.trip.status as keyof typeof STATUS_MAP] ?? {
    label: 'Otro',
    icon: 'mdi:alert-circle',
    variant: 'secondary',
  }
})

const formattedDate = computed(() => {
  return new Date(props.trip.trip_date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})
</script>
