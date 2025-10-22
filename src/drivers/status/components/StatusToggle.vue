<template>
  <div v-if="store.status" class="flex items-center gap-4">
    <Button
      :variant="store.status.driver_status === 'online' ? 'secondary' : 'primary'"
      :loading="store.loading"
      @click="store.updateStatus(store.status.driver_status === 'online' ? 'offline' : 'online')"
    >
      {{ store.status.driver_status === 'online' ? 'Desconectarse' : 'Conectarse' }}
    </Button>
    <span :class="['text-sm', store.status.driver_status === 'online' ? 'text-green-600' : 'text-gray-400']">
      {{ store.status.driver_status === 'online' ? 'Online' : 'Offline' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import Button from '@/ui/Button.vue'
import { useDriverStatusStore } from '../store/driverStatusStore'

const store = useDriverStatusStore()
</script>
