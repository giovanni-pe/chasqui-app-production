<script setup lang="ts">
import MobileBottomNav from '@/ui/MobileBottomNav.vue';

interface Props {
  /** Muestra badge “1” sobre “Request” cuando hay un viaje activo */
  hasActiveTrip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveTrip: false,
});

/* Configura los ítems del bottom-nav */
const navItems = [
  {
    id:   'dashboard',
    label:'Home',
    icon: 'solar:home-2-bold-duotone',
    path: '/passenger/dashboard',
  },
  {
    id:   'request-trip',
    label:'Request',
    icon: 'mdi:car',
    path: '/passenger/trip-request',
    badge: props.hasActiveTrip ? 1 : undefined,
  },
  {
    id:   'history',
    label:'History',
    icon: 'solar:history-3-bold-duotone',
    path: '/passenger/trip-history',
  },
];
</script>

<template>
  <MobileBottomNav :items="navItems" />
</template>
