<template>
  <div
    class="absolute left-0 top-12 right-0 z-30 bg-white rounded-2xl shadow-2xl p-4 overflow-auto transition-all duration-300 ease-in-out max-w-md mx-auto"
    :class="['max-h-[80vh]']"
  >
    <!-- Paso 1: Selecciona colectivo -->
    <div v-if="store.formStep === 1">
      <h3 class="text-base font-semibold mb-2">🚕 Elige un colectivo en la lista o el mapa</h3>
      <p class="text-sm text-gray-500">Toca un colectivo para continuar.</p>
    </div>
    <!-- Paso 2: Selecciona punto de recojo -->
    <div v-else-if="store.formStep === 2">
      <label class="block text-sm font-semibold mb-1">📍 Tu punto de recojo</label>
      <input
        type="text"
        placeholder="Toca el mapa o escribe dirección"
        v-model="pickupText"
        @focus="inputActive = true"
        @blur="inputActive = false"
        class="w-full p-3 border-2 rounded-lg border-gray-200 focus:border-blue-500"
      />
      <button
        @click="useCurrentLocation"
        :disabled="gettingLocation"
        class="mt-2 text-blue-600 hover:underline flex items-center gap-1"
      >
        <span>📡</span> {{ gettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual' }}
      </button>
      <div class="flex justify-between mt-3">
        <button @click="prevStep" class="btn btn-secondary">Anterior</button>
        <button @click="store.pickup ? nextStep : null" :disabled="!store.pickup" class="btn btn-primary">Siguiente</button>
      </div>
    </div>
    <!-- Paso 3: Confirmar reserva -->
    <div v-else-if="store.formStep === 3">
      <label class="block text-sm font-semibold">📝 Notas al conductor (opcional)</label>
      <textarea v-model="notes" rows="2" placeholder="Referencia, punto de encuentro..." class="w-full p-3 border-2 rounded-lg border-gray-200"></textarea>
      <label class="block text-sm font-semibold mt-2">WhatsApp (opcional)</label>
      <input v-model="whatsapp" type="text" placeholder="Número WhatsApp" class="w-full p-3 border-2 rounded-lg border-gray-200" />
      <div class="flex flex-col gap-2 mt-3">
        <button @click="handleReserve" class="btn btn-primary w-full" :disabled="store.loading">
          {{ store.loading ? 'Reservando...' : 'Confirmar Reserva' }}
        </button>
        <button @click="prevStep" class="btn btn-secondary">Anterior</button>
      </div>
    </div>
    <!-- Confirmación -->
    <div v-else-if="store.reservation" class="text-center py-8">
      <h3 class="text-lg font-bold text-green-700 mb-3">¡Reserva realizada!</h3>
      <div class="text-sm mb-2">
        Tu asiento ha sido reservado.<br />
        Espera la confirmación del conductor.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import Swal from 'sweetalert2'
const store = useCollectiveRequestStore();
const notes = ref('');
const whatsapp = ref('');
const pickupText = ref(store.pickup?.address || '');
const gettingLocation = ref(false);
const inputActive = ref(false);

// Sincronizar texto con la selección desde el mapa
watch(
  () => store.pickup,
  (val) => { pickupText.value = val?.address || ''; }
);

// Al cambiar texto en input, limpiar si se borra
watch(pickupText, (val) => {
  if (!val) store.setPickup(null);
});

// Usar ubicación actual
async function useCurrentLocation() {
 if (!navigator.geolocation) {
  await Swal.fire({
    icon: 'warning',
    title: 'Geolocalización no soportada',
    text: 'Tu navegador no soporta la función de geolocalización.',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#6366f1'
  });
  return;
}
  gettingLocation.value = true;
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
    );
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const geocoder = new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });
    const address = results[0]?.formatted_address || 'Mi ubicación actual';
    const loc = { coordinates: { latitude: lat, longitude: lng }, address };
    store.setPickup(loc);
    pickupText.value = address;
  } catch {
  // En tu función:
await Swal.fire({
  icon: 'error',
  title: 'Ubicación no disponible',
  text: 'No se pudo obtener tu ubicación',
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#f43f5e'
});
  } finally {
    gettingLocation.value = false;
  }
}

function nextStep() {
  if (store.formStep < 3) store.setFormStep(store.formStep + 1);
}
function prevStep() {
  if (store.formStep > 1) store.setFormStep(store.formStep - 1);
}

async function handleReserve() {
  const ok = await store.reserveSeat(notes.value, whatsapp.value);
  if (ok) store.setFormStep(4);
}
</script>
