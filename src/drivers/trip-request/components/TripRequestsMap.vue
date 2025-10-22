<template>
  <div class="w-full h-96 relative">
    <div ref="mapRef" class="w-full h-full rounded-lg shadow-md" />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/70 z-10 text-sm text-gray-700"
    >
      Cargando mapa...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useTripRequestsStore } from '../stores/useTripRequestsStore';
import { useGeolocation } from '@/lib/composables/useGeolocation';
import { googleMapsService } from '@/location/services/googleMapsService';

const store = useTripRequestsStore();
const { position, error } = useGeolocation();

const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const markers = ref<google.maps.Marker[]>([]);
const loading = ref(true);

function isValidLatLng(lat: any, lng: any): boolean {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return (
    typeof latNum === 'number' &&
    !isNaN(latNum) &&
    typeof lngNum === 'number' &&
    !isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
}

async function initMap() {
  if (!mapRef.value || !position.value) return;

  try {
    await googleMapsService.initialize();
    const center = new google.maps.LatLng(position.value.latitude, position.value.longitude);

    map.value = new google.maps.Map(mapRef.value, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
    });

    const recenterButton = document.createElement('button');
    recenterButton.textContent = '📍';
    recenterButton.className = 'bg-white rounded-full shadow px-3 py-1 text-lg';
    recenterButton.title = 'Centrar en mi ubicación';
    recenterButton.onclick = () => {
      if (position.value) {
        const loc = new google.maps.LatLng(position.value.latitude, position.value.longitude);
        map.value?.panTo(loc);
        map.value?.setZoom(16);
      }
    };
    map.value.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(recenterButton);

    drawMarkers();
    loading.value = false;
  } catch (e) {
    console.error('[TripRequestsMap] error cargando mapa', e);
    loading.value = false;
  }
}

onMounted(() => {
  const stop = watch(position, (pos) => {
    if (pos) {
      initMap();
      stop();
    }
  }, { immediate: true });
});

watch(() => store.requests, () => drawMarkers(), { immediate: true });

function drawMarkers() {
  if (!map.value) return;
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];

  store.requests.forEach((trip) => {
    const lat = Number(trip.pickup_latitude);
    const lng = Number(trip.pickup_longitude);

    if (!isValidLatLng(lat, lng)) {
      console.warn('[Marker skipped] Coordenadas inválidas:', lat, lng);
      return;
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map.value!,
      icon: {
        url: 'https://api.iconify.design/mdi/map-marker-account.svg?color=%234285f4',
        scaledSize: new google.maps.Size(32, 32)
      },
      title: `${trip.passenger_name} - S/ ${trip.estimated_fare}`,
    });

    marker.addListener('click', () => {
      store.openDrawer(trip);
    });

    markers.value.push(marker);
  });
}

onUnmounted(() => {
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];
});
</script>

<style scoped>
/* Puedes aplicar estilos adicionales si lo deseas */
</style>
