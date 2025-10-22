<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Botón principal con badge dinámico -->
    <button
      @click="handleClick"
      :disabled="!canToggleOnline"
      :class="[
        'relative px-7 py-3 rounded-full font-bold text-lg shadow-lg focus:outline-none transition-all duration-200',
        buttonClass,
        !canToggleOnline && 'cursor-not-allowed opacity-80'
      ]"
    >
      <!-- BADGE ONLINE (elegante y compacto) -->
      <template v-if="isOnline">
        <span class="absolute -top-2 right-5 flex items-center gap-1 bg-white/90 text-green-600 rounded-full shadow px-3 py-0.5 border border-green-300 text-xs font-semibold backdrop-blur z-10">
          <Icon icon="mdi:check-decagram" class="w-4 h-4" />
          Online
          <span v-if="activeVehicle" class="ml-2 flex items-center gap-1 text-gray-500">
            <Icon icon="mdi:car" class="w-4 h-4" />
            {{ activeVehicle.license_plate }}
          </span>
        </span>
      </template>
      <!-- Otros BADGES -->
      <span
        v-else-if="badge"
        class="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-0.5 rounded-full text-xs shadow"
        :class="badgeClass"
      >{{ badge }}</span>

      <span class="flex items-center gap-2">
        <Icon :icon="icon" class="w-7 h-7" />
        <span>
          <!-- Mensaje principal -->
          {{ mainMessage }}
          <!-- Acción sugerida solo si está offline y listo -->
          <template v-if="isOffline">
            <span class="ml-1 inline-flex items-center gap-1 text-sky-700 font-semibold animate-bounce-slow">
              Haz clic aquí
              <Icon icon="mdi:hand-pointing-up" class="w-5 h-5 text-sky-700" />
            </span>
          </template>
          <!-- Esperando verificación -->
          <template v-if="showWaiting" class="ml-2 flex gap-1 items-center animate-pulse text-xs">
            <Icon icon="mdi:clock-outline" class="w-4 h-4" />
            Esperando verificación...
          </template>
        </span>
      </span>
    </button>

    <!-- Panel de detalles -->
    <transition name="fade">
      <div
        v-if="showPanel"
        class="w-full max-w-md mt-2 bg-white rounded-2xl shadow-lg p-5 border"
      >
        <StatusToggle v-if="canToggleOnline"/>
        <VehicleSelector />
        <div class="mt-4 text-xs text-gray-500">
          Documentos:
          {{ store.status?.documents_verified ? '✔️ Verificados' : '❌ No verificados' }}<br />
          Último cambio: {{ formattedLastChange }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StatusToggle from '../components/StatusToggle.vue'
import VehicleSelector from '../components/VehicleSelector.vue'
import { useDriverStatusStore } from '../store/driverStatusStore'
import { Icon } from '@iconify/vue'

const store = useDriverStatusStore()
const showPanel = ref(false)

onMounted(() => {
  store.fetchStatus()
  store.fetchVehicles()
})

const formattedLastChange = computed(() => {
  if (!store.status?.last_status_change) return '—'
  return new Date(store.status.last_status_change).toLocaleString()
})

// Encuentra el vehículo activo por ID (si hay)
const activeVehicle = computed(() => {
  if (!store.status?.active_vehicle_id) return null
  return store.vehicles.find(v => v.id === store.status?.active_vehicle_id) || null
})

// Lógica de estados según status de backend
const canToggleOnline = computed(() =>
  !!store.status?.documents_verified &&
  (store.status.driver_status === 'online' || store.status.driver_status === 'offline')
)

const isOnline = computed(() =>
  store.status?.documents_verified && store.status?.driver_status === 'online'
)
const isOffline = computed(() =>
  store.status?.documents_verified && store.status?.driver_status === 'offline'
)
const isBusy = computed(() =>
  store.status?.documents_verified && store.status?.driver_status === 'busy'
)
const waitingVerification = computed(() =>
  !store.status?.documents_verified
)

const mainMessage = computed(() => {
  if (waitingVerification.value) return 'Esperando verificación del sistema'
  if (isBusy.value) return 'Ocupado (en viaje)'
  if (isOnline.value) return '¡Estás Online!'
  if (isOffline.value) return 'Ponte Online para recibir viajes'
  return 'Verifica tu estado'
})

const icon = computed(() => {
  if (waitingVerification.value) return 'mdi:clock-alert-outline'
  if (isBusy.value) return 'mdi:car-clock'
  if (isOnline.value) return 'mdi:check-circle'
  if (isOffline.value) return 'mdi:alert-circle-outline'
  return 'mdi:account-question'
})

const buttonClass = computed(() => {
  if (waitingVerification.value) return 'bg-gray-100 text-gray-600 border border-gray-300 animate-pulse'
  if (isBusy.value) return 'bg-blue-200 text-blue-900 border-blue-300 animate-pulse'
  if (isOnline.value) return 'bg-green-500 text-white hover:bg-green-600'
  if (isOffline.value) return 'bg-yellow-50 text-yellow-700 border-2 border-yellow-400 animate-pulse'
  return 'bg-gray-200 text-gray-700'
})

const badge = computed(() => {
  if (waitingVerification.value) return 'Revisión'
  if (isBusy.value) return 'Ocupado'
  if (isOffline.value) return 'Actívalo'
  return ''
})

const badgeClass = computed(() => {
  if (waitingVerification.value) return 'bg-gray-400 text-white'
  if (isBusy.value) return 'bg-blue-500 text-white'
  if (isOffline.value) return 'bg-yellow-400 text-white animate-bounce'
  return 'bg-green-500 text-white'
})

const showWaiting = computed(() => waitingVerification.value)

function handleClick() {
  // Solo abre el panel si el botón está habilitado (documentos verificados y NO ocupado)
  if (canToggleOnline.value) showPanel.value = !showPanel.value
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0);}
  50% { transform: translateY(-6px);}
}
.animate-bounce-slow {
  animation: bounce-slow 1.3s infinite;
}
</style>
