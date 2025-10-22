<!-- src/drivers/active-trip/components/DriverActiveTripMap.vue -->
<template>
  <div ref="mapRef" class="w-full h-[400px] rounded-t-2xl" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { LatLngLiteral } from '../types/index'; // o usa directamente `{ lat: number; lng: number }` si no tienes ese tipo

interface Props {
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

const props = defineProps<Props>();

const mapRef = ref<HTMLElement | null>(null);
const mapInstance = ref<google.maps.Map | null>(null);
let directionsRenderer: google.maps.DirectionsRenderer | null = null;

// Inicializar mapa y marcadores
onMounted(() => {
  if (!window.google?.maps || !mapRef.value) return;

  mapInstance.value = new google.maps.Map(mapRef.value, {
    center: props.pickup,
    zoom: 15,
    disableDefaultUI: true,
    zoomControl: true,
  });

  new google.maps.Marker({
    position: props.pickup,
    map: mapInstance.value,
    label: '📍',
    title: 'Punto de recojo',
  });

  new google.maps.Marker({
    position: props.destination,
    map: mapInstance.value,
    label: '🏁',
    title: 'Destino',
  });

  trazarRuta();
});

function trazarRuta() {
  if (!window.google?.maps || !mapInstance.value) return;

  if (directionsRenderer) {
    directionsRenderer.setMap(null);
    directionsRenderer = null;
  }

  const directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: mapInstance.value,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#4285F4',
      strokeOpacity: 0.9,
      strokeWeight: 6,
    },
  });

  directionsService.route(
    {
      origin: props.pickup,
      destination: props.destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer!.setDirections(result);
      } else {
        console.warn('No se pudo trazar la ruta:', status);
      }
    }
  );
}

watch(() => [props.pickup, props.destination], trazarRuta, { deep: true });

onUnmounted(() => {
  directionsRenderer?.setMap(null);
  directionsRenderer = null;
});
</script>
