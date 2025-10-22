<template>
  <div>
    <div v-if="!store.vehicles.length" class="text-gray-500">
      No hay vehículos registrados.
    </div>
    <select
      v-else
      :value="store.status?.active_vehicle_id ?? ''"
      @change="store.updateStatus('online', +((($event.target as HTMLSelectElement)?.value ?? '')))"
      class="block w-full border rounded-lg px-3 py-2 mt-1"
      :disabled="store.loading"
    >
      <option value="" disabled>Selecciona vehículo</option>
      <option
        v-for="v in store.vehicles"
        :key="v.id"
        :value="v.id"
      >
        {{ v.brand }} {{ v.model }} ({{ v.license_plate }})
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useDriverStatusStore } from '../store/driverStatusStore'

const store = useDriverStatusStore()
</script>
