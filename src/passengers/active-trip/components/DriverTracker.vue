<template>
  <div class="relative w-full">
    <!-- Mapa con altura adaptable -->
    <div ref="mapRef" class="rounded-xl shadow-inner h-[380px] sm:h-[460px]" />

    <!-- Panel flotante de ofertas -->
    <DriverOffersPanel v-if="trip?.status === 'pending'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';
import { googleMapsService } from '@/location/services/googleMapsService';
import DriverOffersPanel from './DriverOffersPanel.vue';

const store = useActiveTripStore();
const trip = computed(() => store.trip);

const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);

const currentPos = ref<{ lat: number; lng: number } | null>(null);
const passengerMarker = ref<google.maps.Marker | null>(null);
const driverMarker = ref<google.maps.Marker | null>(null);
const polyline = ref<google.maps.Polyline | null>(null);

function toLatLng(lat: number | string, lng: number | string) {
  return new window.google.maps.LatLng(Number(lat), Number(lng));
}

function getMarkerIcon(icon: string, color: string): string {
  const svg = encodeURIComponent(`
    <svg width='32' height='32' viewBox='0 0 24 24' fill='${color}' xmlns='http://www.w3.org/2000/svg'>
      <path d='${icon}' />
    </svg>
  `);
  return `data:image/svg+xml,${svg}`;
}

const ICONS = {
  origin: getMarkerIcon(
    'M12 2C8.13 2 5 5.13 5 9c0 4.05 4.8 9.34 6.39 11.03a1 1 0 0 0 1.44 0C14.2 18.34 19 13.05 19 9c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z',
    '#10b981'
  ),
  destination: getMarkerIcon(
    'M6 3h12a2 2 0 0 1 2 2v14l-6-3-6 3V5a2 2 0 0 1 2-2z',
    '#ef4444'
  ),
  driver: getMarkerIcon(
    'M18.92 6.01C18.72 5.42 18.15 5 17.5 5H6.5c-.65 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1s1-.45 1-1v-1h14v1c0 .55.45 1 1 1s1-.45 1-1v-8l-2.08-5.99z',
    '#facc15'
  ),
};

function getPolylineColor(status: string | undefined): string {
  const colors: Record<string, string> = {
    pending: '#FFA500',
    driver_assigned: '#00BCD4',
    en_route: '#4CAF50',
    arrived: '#9C27B0',
    in_progress: '#2196F3',
    completed: '#8BC34A',
  };
  return colors[status ?? 'pending'] || '#4285F4';
}

onMounted(async () => {
  await googleMapsService.initialize();
  if (!mapRef.value) return;

  map.value = new window.google.maps.Map(mapRef.value, {
    center: { lat: -9.3, lng: -75.99 },
    zoom: 14,
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: false,
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentPos.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  }
});

watch([trip, currentPos], async () => {
  if (!map.value || !trip.value || !currentPos.value) return;

  const origin = {
    latitude: currentPos.value.lat,
    longitude: currentPos.value.lng,
  };

  const destination = trip.value.destination.coordinates;

  passengerMarker.value?.setMap(null);
  new window.google.maps.Marker({
    position: toLatLng(origin.latitude, origin.longitude),
    map: map.value,
    icon: ICONS.origin,
  });

  new window.google.maps.Marker({
    position: toLatLng(destination.latitude, destination.longitude),
    map: map.value,
    icon: ICONS.destination,
  });

  polyline.value?.setMap(null);
  const route = await googleMapsService.calculateRoute({
    origin: { address: 'Mi ubicación', coordinates: origin },
    destination: { address: trip.value.destination.address, coordinates: destination },
    travelMode: 'DRIVING',
  });

  const decoded = window.google.maps.geometry.encoding.decodePath(route.polyline);
  polyline.value = new google.maps.Polyline({
    path: decoded,
    map: map.value,
    strokeColor: getPolylineColor(trip.value.status),
    strokeOpacity: 0.85,
    strokeWeight: 5,
  });

  const bounds = new window.google.maps.LatLngBounds();
  decoded.forEach((pt) => bounds.extend(pt));
  map.value.fitBounds(bounds);
});

watch(
  () => trip.value?.driver?.location,
  (loc) => {
    if (!map.value || !loc) return;
    const pos = toLatLng(loc.latitude, loc.longitude);
    if (!driverMarker.value) {
      driverMarker.value = new window.google.maps.Marker({
        position: pos,
        map: map.value,
        icon: ICONS.driver,
      });
    } else {
      driverMarker.value.setPosition(pos);
    }
  },
  { immediate: true, deep: true }
);
</script>
