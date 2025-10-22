<template>
  <div class="w-full h-72 rounded-2xl overflow-hidden mt-6 relative">
    <div ref="mapRef" class="w-full h-full" />
    <div v-if="store.activeSelection"
      class="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow-lg animate-pulse z-10">
      {{ store.activeSelection === 'origin'
        ? 'Toca el mapa para elegir el punto de partida'
        : 'Toca el mapa para elegir el destino' }}
    </div>
    <div v-if="store.error"
      class="absolute bottom-2 left-2 bg-red-50 border border-red-200 px-3 py-1 rounded shadow">
      <span class="text-red-700 text-xs">{{ store.error }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import { googleMapsService } from '@/location/services/googleMapsService';

export default defineComponent({
  name: 'CollectiveMapView',
  setup() {
    const store = useCollectiveRequestStore();
    const mapRef = ref<HTMLDivElement | null>(null);

    let mapInstance: google.maps.Map | null = null;
    let originMarker: google.maps.Marker | null = null;
    let destMarker: google.maps.Marker | null = null;
    let routePolyline: google.maps.Polyline | null = null;

    // Inicializa mapa
    onMounted(async () => {
      if (!mapRef.value) return;
      await googleMapsService.initialize();

      mapInstance = new google.maps.Map(mapRef.value, {
        center: { lat: -9.3067, lng: -75.9947 },
        zoom: 13,
        disableDefaultUI: false,
      });

      mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
        if (!store.activeSelection || !e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        try {
          const { results } = await new google.maps.Geocoder().geocode({ location: { lat, lng } });
          const address = results[0]?.formatted_address || '';
          const loc = { coordinates: { latitude: lat, longitude: lng }, address };
          if (store.activeSelection === 'origin') {
            store.setOrigin(loc);
            originMarker?.setMap(null);
            originMarker = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeWeight: 2, strokeColor: '#FFF' },
            });
          } else {
            store.setDestination(loc);
            destMarker?.setMap(null);
            destMarker = new google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#EA4335', fillOpacity: 1, strokeWeight: 2, strokeColor: '#FFF' },
            });
          }
          store.setActiveSelection(null);
        } catch {
          store.setError('No se pudo obtener la dirección.');
        }
      });
    });

    // Traza la ruta cuando ambos puntos están listos
    watch(
      () => [store.origin, store.destination],
      async ([origin, destination]) => {
        if (!mapInstance) return;
        // Limpia ruta anterior
        routePolyline?.setMap(null);

        if (!origin || !destination) return;

        // Llama al servicio para obtener la ruta
        try {
          const route = await googleMapsService.calculateRoute({
            origin,
            destination,
            travelMode: 'DRIVING', // O 'TWO_WHEELER' si tu servicio lo soporta
          });

          // route.polyline puede ser un polyline codificado, decodifícalo:
          const path = google.maps.geometry.encoding.decodePath(route.polyline);
          routePolyline = new google.maps.Polyline({
            path,
            map: mapInstance,
            strokeColor: '#4B83F5',
            strokeOpacity: 0.9,
            strokeWeight: 5,
          });

          // Ajusta el mapa a la ruta
          const bounds = new google.maps.LatLngBounds();
          path.forEach(pt => bounds.extend(pt));
          mapInstance.fitBounds(bounds, 80);

        } catch (err) {
          store.setError('No se pudo calcular la ruta.');
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      originMarker?.setMap(null);
      destMarker?.setMap(null);
      routePolyline?.setMap(null);
      mapInstance = null;
    });

    return { store, mapRef };
  },
});
</script>
