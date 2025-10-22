<script setup lang="ts">
import MobileBottomNav from '@/ui/MobileBottomNav.vue'

interface Props {
  /** Muestra badge “1” sobre “Solicitud” cuando hay un viaje activo */
  hasActiveTrip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveTrip: false,
})

/* Ítems del menú inferior */
const navItems = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: 'mdi:home-variant-outline', // Futurista y claro
    path: '/driver/dashboard',
  },
  {
    id: 'request-trip',
    label: 'Solicitud',
    icon: 'mdi:car-arrow-right', // Representa enviar viaje
    path: '/driver/trip-request',
    badge: props.hasActiveTrip ? 1 : undefined,
  },
  {
    id: 'earnings',
    label: 'Ganancias',
    icon: 'mdi:cash-multiple', // Muy claro para dinero
    path: '/driver/earnings',
  },
]
</script>

<template>
  <MobileBottomNav :items="navItems" />
</template>
