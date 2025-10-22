<template>
  <div class="w-full h-64 rounded-xl shadow relative overflow-hidden bg-white">
    <div ref="mapRef" class="w-full h-full" />
    <div v-if="store.loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
      <span class="text-gray-500">Cargando mapa...</span>
    </div>
    <div v-if="store.error" class="absolute top-2 left-2 bg-red-100 text-red-700 px-3 py-1 rounded shadow z-10 text-xs">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';
import { googleMapsService } from '@/location/services/googleMapsService';

const store = useCollectiveActiveStore();
const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const markers = ref<google.maps.Marker[]>([]);

async function initMap() {
  await googleMapsService.initialize();
  if (!mapRef.value || !store.trip) return;

  map.value = new google.maps.Map(mapRef.value, {
    center: {
      lat: Number(store.trip.pickup_latitude) || -9.3,
      lng: Number(store.trip.pickup_longitude) || -75.99,
    },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
  });

  drawTrip();
}

function drawTrip() {
  if (!map.value || !store.trip) return;
  markers.value.forEach(m => m.setMap(null));
  markers.value = [];

  // Origen
  markers.value.push(new google.maps.Marker({
    position: { lat: Number(store.trip.pickup_latitude), lng: Number(store.trip.pickup_longitude) },
    map: map.value,
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#1E90FF', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
    label: { text: 'Inicio', color: '#1E90FF', fontWeight: 'bold' },
    zIndex: 1,
  }));

  // Destino
  markers.value.push(new google.maps.Marker({
    position: { lat: Number(store.trip.destination_latitude), lng: Number(store.trip.destination_longitude) },
    map: map.value,
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#E63946', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
    label: { text: 'Fin', color: '#E63946', fontWeight: 'bold' },
    zIndex: 1,
  }));

  // Pasajeros
  store.passengers.forEach(p => {
    const isFocused = p.id === store.focusedPassengerId;
    const iconColor = isFocused
      ? '#FFC107'
      : (p.status === 'aboard' ? '#4CAF50'
        : p.status === 'reserved' ? '#2196F3'
        : '#B0BEC5');
    markers.value.push(new google.maps.Marker({
      position: { lat: Number(p.pickup_latitude), lng: Number(p.pickup_longitude) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: isFocused ? 7 : 5,
        fillColor: iconColor,
        fillOpacity: 1,
        strokeColor: isFocused ? '#FF9800' : '#fff',
        strokeWeight: isFocused ? 4 : 2,
      },
      title: p.name + (isFocused ? ' (seleccionado)' : '') + ' - ' + p.status,
      label: { text: p.name[0], color: '#fff', fontWeight: 'bold' },
      zIndex: isFocused ? 10 : 2,
    }));
  });

 }


onMounted(() => {
  if (!store.trip) return;
  initMap();
});

watch(() => store.trip, () => {
  if (map.value) drawTrip();
  else if (store.trip) initMap();
});

watch(() => store.passengers, () => {
  if (map.value) drawTrip();
});

// Centrar mapa y redibujar cuando se cambia el foco
watch(
  () => store.mapFocus,
  (focus) => {
    if (focus && map.value) {
      map.value.setCenter({ lat: focus.lat, lng: focus.lng });
      if (focus.zoom) map.value.setZoom(focus.zoom);
      drawTrip(); // Redibuja para resaltar
      // No limpies el foco aquí, deja que lo limpie el usuario si quiere
    }
  }
);
</script>
