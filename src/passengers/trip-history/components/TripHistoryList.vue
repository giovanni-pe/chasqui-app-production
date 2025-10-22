<template>
  <div v-if="loading" class="flex items-center justify-center py-6">
    <Icon icon="mdi:loading" class="w-6 h-6 animate-spin text-gray-500" />
    <span class="ml-2 text-gray-500">Cargando viajes...</span>
  </div>

  <div v-else-if="error" class="text-red-600 text-center py-4">
    <Icon icon="mdi:alert-circle-outline" class="w-5 h-5 inline mr-1" />
    {{ error }}
  </div>

  <Card v-else-if="!safeTrips.length" class="p-6 text-center">
    <Icon icon="mdi:history" class="w-12 h-12 text-gray-400 mb-2 animate-float" />
    <p class="text-gray-500 mb-4">Aún no hay viajes en tu historial.</p>
  </Card>

  <template v-else>
    <ul class="space-y-4 px-2">
      <TripCard
        v-for="trip in paginatedTrips"
        :key="trip.id"
        :trip="trip"
      />
    </ul>

    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-3 mt-4">
      <Button
        variant="ghost"
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded-full"
      >
        <Icon icon="mdi:chevron-left" class="w-5 h-5" />
      </Button>
      <span class="text-sm text-gray-600">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      <Button
        variant="ghost"
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded-full"
      >
        <Icon icon="mdi:chevron-right" class="w-5 h-5" />
      </Button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { useTripHistoryStore } from '../store/useTripHistoryStore'

import Card from '@/ui/Card.vue'
import Button from '@/ui/Button.vue'
import TripCard from './TripCard.vue'

const itemsPerPage = 2
const currentPage = ref(1)

const store = useTripHistoryStore()
const { trips, loading, error } = storeToRefs(store) // ✅ Mantiene reactividad

const safeTrips = computed(() => trips.value ?? [])

const totalPages = computed(() =>
  Math.ceil(safeTrips.value.length / itemsPerPage)
)

const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return safeTrips.value.slice(start, start + itemsPerPage)
})

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal || 1
  }
})
onMounted(()=>store.fetchTrips("completed"))
</script>
