<template>
  <div class="h-60 w-full rounded-xl overflow-hidden mb-4 relative">
    <div ref="mapRef" class="w-full h-full" />
    <div
      v-if="store.loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 z-10"
    >
      <span class="text-gray-700">Cargando mapa...</span>
    </div>
    <div
      v-if="mapError"
      class="absolute top-4 left-4 bg-red-50 border border-red-200 text-red-700 p-2 rounded shadow z-20"
    >
      {{ mapError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { googleMapsService } from '@/location/services/googleMapsService';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';

const store = useCollectiveActiveStore();

const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const polylineRef = ref<google.maps.Polyline | null>(null);

const markers = ref<{
  origin?: google.maps.Marker;
  destination?: google.maps.Marker;
  passenger?: google.maps.Marker;
}>({});

const mapError = ref<string | null>(null);

function clearMarkers() {
  Object.values(markers.value).forEach(m => m?.setMap(null));
  markers.value = {};
}

onMounted(async () => {
  if (!mapRef.value) return;

  try {
    await googleMapsService.initialize();

    const defaultLoc = {
      lat: Number(store.trip?.pickup_latitude) || -9.3067,
      lng: Number(store.trip?.pickup_longitude) || -75.9947,
    };

    map.value = new google.maps.Map(mapRef.value, {
      center: defaultLoc,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ],
    });

    drawMarkersAndRoute();
  } catch (e) {
    mapError.value = 'No se pudo cargar el mapa';
  }
});

onUnmounted(() => {
  clearMarkers();
  polylineRef.value?.setMap(null);
});

watch(
  () => [store.trip, store.myReservation],
  () => {
    drawMarkersAndRoute();
  },
  { deep: true }
);

function drawMarkersAndRoute() {
  if (!map.value || !store.trip) return;
  clearMarkers();
  polylineRef.value?.setMap(null);

  // 1. Origen
  const originLatLng = {
    lat: Number(store.trip.pickup_latitude),
    lng: Number(store.trip.pickup_longitude),
  };
  markers.value.origin = new google.maps.Marker({
    position: originLatLng,
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: '#2196f3',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#fff',
    },
    title: 'Origen',
    zIndex: 1,
  });

  // 2. Destino
  const destLatLng = {
    lat: Number(store.trip.destination_latitude),
    lng: Number(store.trip.destination_longitude),
  };
  markers.value.destination = new google.maps.Marker({
    position: destLatLng,
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: '#ff5252',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#fff',
    },
    title: 'Destino',
    zIndex: 1,
  });

  // 3. Tu ubicación de embarque (pickup del pasajero actual)
  if (store.myReservation) {
    const passLatLng = {
      lat: Number(store.myReservation.pickup_latitude),
      lng: Number(store.myReservation.pickup_longitude),
    };
    markers.value.passenger = new google.maps.Marker({
      position: passLatLng,
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#ff9800',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff',
      },
      title: 'Mi ubicación de embarque',
      zIndex: 2,
    });

    // Centrar mapa para ver todos los puntos
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originLatLng);
    bounds.extend(destLatLng);
    bounds.extend(passLatLng);
    map.value.fitBounds(bounds, 60);
  } else {
    // Solo origen/destino
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originLatLng);
    bounds.extend(destLatLng);
    map.value.fitBounds(bounds, 60);
  }

  // 4. Dibujar la ruta origen->destino
  googleMapsService
    .calculateRoute({
      origin: {
        coordinates: {
          latitude: Number(store.trip.pickup_latitude),
          longitude: Number(store.trip.pickup_longitude),
        },
        address: store.trip.pickup_address,
      },
      destination: {
        coordinates: {
          latitude: Number(store.trip.destination_latitude),
          longitude: Number(store.trip.destination_longitude),
        },
        address: store.trip.destination_address,
      },
      travelMode: 'DRIVING',
    })
    .then(route => {
      if (route.polyline && map.value) {
        const path = google.maps.geometry.encoding.decodePath(route.polyline);
        polylineRef.value = new google.maps.Polyline({
          path,
          map: map.value,
          strokeColor: '#1976d2',
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });
      }
    })
    .catch(() => {
      // No se pudo dibujar la ruta, no es crítico
    });
}
</script>
