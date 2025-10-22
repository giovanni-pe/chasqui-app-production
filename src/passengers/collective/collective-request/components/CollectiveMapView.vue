<template>
  <div class="w-full h-full fixed inset-0 z-0">
    <div ref="mapRef" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import { googleMapsService } from '@/location/services/googleMapsService';

const store = useCollectiveRequestStore();
const mapRef = ref<HTMLDivElement | null>(null);
const markers = ref<google.maps.Marker[]>([]);

watch(
  () => store.trips,
  () => drawMarkers()
);

watch(
  () => store.selectedTrip,
  () => {
    if (store.selectedTrip && map.value) {
      map.value.setCenter({
        lat: store.selectedTrip.pickup_latitude,
        lng: store.selectedTrip.pickup_longitude,
      });
      map.value.setZoom(14);
    }
  }
);

const map = ref<google.maps.Map | null>(null);

function drawMarkers() {
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];
  if (!map.value) return;
  store.trips.forEach(trip => {
    const marker = new google.maps.Marker({
      position: { lat: trip.pickup_latitude, lng: trip.pickup_longitude },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4,
        fillColor: '#FFD700',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#22477D',
      },
      label: {
        text: trip.trip_code,
        color: '#22477D',
        fontWeight: 'bold',
        fontSize: '12px',
      },
      zIndex: 800,
      title: trip.pickup_address,
    });
    marker.addListener('click', () => {
      store.setSelectedTrip(trip);
    });
    markers.value.push(marker);
  });
}

onMounted(async () => {
  if (!mapRef.value) return;
  await googleMapsService.initialize();
  map.value = new google.maps.Map(mapRef.value, {
    center: { lat: -9.3067, lng: -75.9947 },
    zoom: 13,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: true,
    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
  });
  drawMarkers();
});
onUnmounted(() => {
  if (map.value) google.maps.event.clearInstanceListeners(map.value);
});
</script>
