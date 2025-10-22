<!-- src/passengers/trip-request/components/MapView.vue -->
<template>
  <div class="w-full h-full fixed inset-0 z-0">
    <div ref="mapRef" class="w-full h-full" />

    <!-- Loading -->
    <div
      v-if="!map && store.loadingMap"
      class="absolute inset-0 flex items-center justify-center bg-white/70 z-10"
    >
      <p class="text-gray-700">Cargando mapa...</p>
    </div>

    <!-- Error -->
    <div
      v-if="store.mapError"
      class="absolute top-4 left-4 bg-red-50 border border-red-200 p-2 rounded z-10"
    >
      <p class="text-red-700 text-sm">{{ store.mapError }}</p>
    </div>

    <!-- Selección activa -->
    <div
      v-if="store.activeSelection"
      class="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse z-10"
    >
      {{ store.activeSelection === 'origin' ? 'Toca en el mapa para elegir origen' : 'Toca en el mapa para elegir destino' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { googleMapsService } from '@/location/services/googleMapsService';
import { useTripRequestStore } from '@/passengers/trip-request/stores/useTripRequestStore';

const store = useTripRequestStore();
const mapRef = ref<HTMLDivElement | null>(null);

const map = ref<google.maps.Map | null>(null);
const mapInstanceRef = ref<google.maps.Map | null>(null);
const polylineRef = ref<google.maps.Polyline | null>(null);
const markers = ref<{ origin?: google.maps.Marker; destination?: google.maps.Marker }>({});

const activeSelRef = ref(store.activeSelection);
watch(() => store.activeSelection, val => activeSelRef.value = val);

// Init mapa
onMounted(async () => {
  if (!mapRef.value) return;

  try {
    store.setLoadingMap(true);
    await googleMapsService.initialize();

    const defaultLoc = { lat: -9.3067, lng: -75.9947 }; // Tingo María
    const mapInst = new google.maps.Map(mapRef.value, {
      center: defaultLoc,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
      streetViewControl: true,
      fullscreenControl: true,
      scaleControl: true,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
    });

    mapInstanceRef.value = mapInst;
    map.value = mapInst;
    store.setLoadingMap(false);

    // Botón de ubicación
    const recenterButton = document.createElement('button');
    recenterButton.textContent = '◉';
    recenterButton.title = 'Mi ubicación';
    recenterButton.classList.add('bg-white', 'p-2', 'rounded-full', 'shadow-md', 'hover:bg-gray-100');
    recenterButton.style.cursor = 'pointer';
    mapInst.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(recenterButton);
    recenterButton.addEventListener('click', () => {
      navigator.geolocation?.getCurrentPosition(pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapInst.panTo(loc);
        mapInst.setZoom(16);
      });
    });

    // Listeners
    mapInst.addListener('click', handleMapClick);
    mapInst.addListener('idle', () => store.setMapError(null));
  } catch (e) {
    console.error(e);
    store.setMapError('No se pudo cargar el mapa');
    store.setLoadingMap(false);
  }
});

onUnmounted(() => {
  if (polylineRef.value) polylineRef.value.setMap(null);
  mapInstanceRef.value && google.maps.event.clearInstanceListeners(mapInstanceRef.value);
});

// Manejador de clics en el mapa
async function handleMapClick(e: google.maps.MapMouseEvent) {
  const sel = activeSelRef.value;
  if (store.status !== 'idle' || !sel || !e.latLng) return;

  const lat = e.latLng.lat();
  const lng = e.latLng.lng();

  const temp = new google.maps.Marker({
    position: { lat, lng },
    map: mapInstanceRef.value!,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: '#FFA500',
      fillOpacity: 0.8,
      strokeWeight: 1,
      strokeColor: '#FFF'
    },
    animation: google.maps.Animation.BOUNCE
  });

  try {
    const { results } = await new google.maps.Geocoder().geocode({ location: { lat, lng } });
    temp.setMap(null);

    if (results?.[0]) {
      const address = results[0].formatted_address;
      const loc = {
        coordinates: { latitude: lat, longitude: lng },
        address
      };

      const color = sel === 'origin' ? '#4285F4' : '#EA4335';
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.value!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#FFF'
        },
        zIndex: 1000
      });

      if (sel === 'origin') {
        markers.value.origin?.setMap(null);
        store.setOrigin(loc);
        markers.value.origin = marker;
      } else {
        markers.value.destination?.setMap(null);
        store.setDestination(loc);
        markers.value.destination = marker;
      }

      store.setActiveSelection(null);
      marker.setAnimation(google.maps.Animation.DROP);
      setTimeout(() => marker.setAnimation(null), 800);
    }
  } catch (err) {
    console.error(err);
  }
}

// Redibujar markers
watch([() => store.origin, () => store.destination], () => {
  if (!map.value) return;

  const update = (type: 'origin' | 'destination', loc: any, color: string) => {
    if (!loc) return;
    const pos = new google.maps.LatLng(loc.coordinates.latitude, loc.coordinates.longitude);
    const prev = markers.value[type];
    if (!prev || !prev.getPosition()?.equals(pos)) {
      prev?.setMap(null);
      const m = new google.maps.Marker({
        position: pos,
        map: map.value!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#FFF'
        },
        zIndex: 1000
      });
      markers.value[type] = m;
    }
  };

  update('origin', store.origin, '#4285F4');
  update('destination', store.destination, '#EA4335');
});

// Dibujar ruta
watch([() => store.origin, () => store.destination], async () => {
  if (!store.origin || !store.destination || !map.value) {
    store.setRouteInfo(null);
    polylineRef.value?.setMap(null);
    return;
  }

  try {
    const route = await googleMapsService.calculateRoute({
      origin: store.origin,
      destination: store.destination,
      travelMode: 'DRIVING'
    });

    store.setRouteInfo(route);
    polylineRef.value?.setMap(null);

    const path = google.maps.geometry.encoding.decodePath(route.polyline);
    if (path.length) {
      polylineRef.value = new google.maps.Polyline({
        path,
        map: map.value,
        strokeColor: '#4B83F5',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        zIndex: 100
      });

      const bounds = new google.maps.LatLngBounds();
      path.forEach(pt => bounds.extend(pt));
      map.value.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  } catch (e) {
    console.error(e);
    store.setRouteInfo(null);
  }
});
</script>
