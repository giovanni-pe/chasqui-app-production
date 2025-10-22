<template>
  <div ref="miniMapRef" class="w-full h-full rounded-xl shadow-inner" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { CollectiveTrip, Location } from '../types';
import { googleMapsService } from '@/location/services/googleMapsService';

const props = defineProps<{
  trip: CollectiveTrip,
  pickup: Location | null
}>();
const emit = defineEmits(['pickup-selected']);

const miniMapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const pickupMarker = ref<google.maps.Marker | null>(null);
const routePolyline = ref<google.maps.Polyline | null>(null);

onMounted(async () => {
  if (!miniMapRef.value) return;
  await googleMapsService.initialize();
  map.value = new google.maps.Map(miniMapRef.value, {
    center: { lat: props.trip.pickup_latitude, lng: props.trip.pickup_longitude },
    zoom: 13,
    disableDefaultUI: true,
    gestureHandling: 'cooperative',
  });
  drawRoute();
  map.value.addListener('click', handleMapClick);
  drawPickupMarker();
});

watch(() => props.pickup, drawPickupMarker);

function drawRoute() {
  routePolyline.value?.setMap(null);
  googleMapsService.calculateRoute({
    origin: {
      coordinates: {
        latitude: props.trip.pickup_latitude,
        longitude: props.trip.pickup_longitude,
      },
      address: props.trip.pickup_address,
    },
    destination: {
      coordinates: {
        latitude: props.trip.destination_latitude,
        longitude: props.trip.destination_longitude,
      },
      address: props.trip.destination_address,
    },
    travelMode: 'DRIVING',
  }).then(route => {
    const path = google.maps.geometry.encoding.decodePath(route.polyline);
    routePolyline.value = new google.maps.Polyline({
      path,
      map: map.value!,
      strokeColor: '#4B83F5',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      zIndex: 100,
    });
    // Centrar vista
    const bounds = new google.maps.LatLngBounds();
    path.forEach(pt => bounds.extend(pt));
    map.value!.fitBounds(bounds);
  });
}
function drawPickupMarker() {
  pickupMarker.value?.setMap(null);
  if (!props.pickup || !map.value) return;
  pickupMarker.value = new google.maps.Marker({
    position: {
      lat: props.pickup.coordinates.latitude,
      lng: props.pickup.coordinates.longitude,
    },
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#43a047',
      fillOpacity: 1,
      strokeWeight: 3,
      strokeColor: '#FFF',
    },
    zIndex: 1100,
  });
}
function handleMapClick(e: google.maps.MapMouseEvent) {
  if (!e.latLng) return;
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  new google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results && results[0]) {
      const address = results[0].formatted_address;
      emit('pickup-selected', { coordinates: { latitude: lat, longitude: lng }, address });
    }
  });
}
</script>
