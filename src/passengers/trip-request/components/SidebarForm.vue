<template>
  <div
    class="absolute left-0 top-12 right-0 z-20 bg-white rounded-2xl shadow-2xl p-4 overflow-auto transition-all duration-300 ease-in-out"
    :class="[
      isTyping
        ? 'max-h-[85vh]'              /* 1. Altura máxima si el usuario está escribiendo */
        : store.activeSelection
        ? 'max-h-[60vh]'              /* 2. Altura media si solo hay foco */
        : 'max-h-[50%]'               /* 3. Altura por defecto */
    ]">
    <MqttStatus />

    <!-- Indicador de pasos -->
    <div class="flex justify-between mb-4">
      <div
        v-for="n in 4"
        :key="n"
        class="flex-1 h-1 mx-1 rounded"
        :class="step >= n ? 'bg-blue-600' : 'bg-gray-200'"
      ></div>
    </div>

    <!-- Paso 1: Origen -->
    <div v-if="step === 1">
      <label class="block text-sm font-semibold mb-1">📍 Origen</label>
      <input
        ref="originInputRef"
        type="text"
        placeholder="Escribe o selecciona en el mapa"
        @focus="() => store.setActiveSelection('origin')"
        @blur="() => store.setActiveSelection(null)"
        v-model="originText"
        @input="() => { if (!originText) store.setOrigin(null) }"
        :class="[
          'w-full p-3 border-2 rounded-lg transition',
          formErrors.origin
            ? 'border-red-500'
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
        ]"
      />
      <p v-if="formErrors.origin" class="text-red-500 text-xs mt-1">
        {{ formErrors.origin }}
      </p>
      <div class="flex justify-between items-center mt-3">
        <button
          @click="useCurrentAsOrigin"
          :disabled="gettingLocation"
          class="flex items-center gap-2 text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
          {{ gettingLocation ? 'Obteniendo...' : 'Mi ubicación' }}
        </button>
        <button @click="nextStep" class="btn btn-primary">Siguiente</button>
      </div>
    </div>

    <!-- Paso 2: Destino -->
    <div v-if="step === 2">
      <label class="block text-sm font-semibold mb-1">🏁 Destino</label>
      <input
        ref="destinationInputRef"
        type="text"
        placeholder="Escribe o selecciona en el mapa"
        @focus="() => store.setActiveSelection('destination')"
        @blur="() => store.setActiveSelection(null)"
        v-model="destText"
        @input="() => { if (!destText) store.setDestination(null) }"
        :class="[
          'w-full p-3 border-2 rounded-lg transition',
          formErrors.destination
            ? 'border-red-500'
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
        ]"
      />
      <p v-if="formErrors.destination" class="text-red-500 text-xs mt-1">
        {{ formErrors.destination }}
      </p>
      <div class="flex justify-between mt-3">
        <button @click="step--" class="btn btn-secondary">Anterior</button>
        <button @click="nextStep" class="btn btn-primary">Siguiente</button>
      </div>
    </div>

    <!-- Paso 3: Servicio -->
    <div v-if="step === 3">
      <label class="block text-sm font-semibold">🚗 Tipo de servicio</label>
      <select
        v-model="store.serviceTypeId"
        @change="clearErrors"
        :class="[
          'w-full p-3 border-2 rounded-lg transition',
          formErrors.serviceType ? 'border-red-500' : 'border-gray-200'
        ]"
      >
        <option value="">Selecciona...</option>
        <option value="1">🏍️ Mototaxi</option>
        <option value="2">🚗 Auto</option>
      </select>
      <p v-if="formErrors.serviceType" class="text-red-500 text-xs mt-1">
        {{ formErrors.serviceType }}
      </p>

      <label class="block text-sm font-semibold mt-4">💰 Precio ofrecido</label>
      <input
        type="number"
        min="0"
        step="0.5"
        v-model.number="store.offerPrice"
        placeholder="0.00"
        class="w-full p-3 border-2 rounded-lg border-gray-200"
      />
      <div class="flex justify-between mt-3">
        <button @click="step--" class="btn btn-secondary">Anterior</button>
        <button @click="nextStep" class="btn btn-primary">Siguiente</button>
      </div>
    </div>

    <!-- Paso 4: Confirmación -->
    <div v-if="step === 4">
      <label class="block text-sm font-semibold">📝 Notas adicionales</label>
      <textarea
        v-model="localNotes"
        rows="3"
        placeholder="Instrucciones especiales..."
        class="w-full p-3 border-2 rounded-lg border-gray-200"
      ></textarea>

      <div class="flex justify-between mt-3">
        <button @click="step--" class="btn btn-secondary">Anterior</button>
        <button
          class="btn btn-primary w-full"
          @click="handleConfirm"
          :disabled="store.loading || store.loadingMap"
        >
          {{ store.loading ? 'Confirmando...' : '🚀 Confirmar Viaje' }}
        </button>
      </div>

      <button
        v-if="store.status !== 'idle'"
        @click="store.cancelTrip"
        class="mt-2 btn btn-secondary w-full"
      >
        ❌ Cancelar Viaje
      </button>
    </div>

    <p v-if="store.mapError" class="text-red-600 text-xs mt-2">
      {{ store.mapError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useTripRequestStore } from '@/passengers/trip-request/stores/useTripRequestStore';
import MqttStatus from '@/ui/MqttStatus.vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'
const router = useRouter();
const store = useTripRequestStore();

const originInputRef = ref<HTMLInputElement | null>(null);
const destinationInputRef = ref<HTMLInputElement | null>(null);
const step = ref<1 | 2 | 3 | 4>(1);
const originText = ref('');
const destText = ref('');
const localNotes = ref('');
const gettingLocation = ref(false);
const formErrors = ref<Record<string, string>>({});

const isTyping = computed(() => {
  if (store.activeSelection === 'origin') return originText.value.length > 0;
  if (store.activeSelection === 'destination') return destText.value.length > 0;
  return false;
});

// Sincronizar texto cuando cambia desde mapa
watch(
  () => store.origin,
  (val) => {
    if (val?.address) originText.value = val.address;
  }
);
watch(
  () => store.destination,
  (val) => {
    if (val?.address) destText.value = val.address;
  }
);

// Autocomplete en inputs
onMounted(() => {
  watch(
    () => store.activeSelection,
    (sel) => {
      if (!sel || !window.google?.maps?.places) return;

      const input = sel === 'origin' ? originInputRef.value! : destinationInputRef.value!;
      const ac = new google.maps.places.Autocomplete(input, {
        fields: ['geometry', 'formatted_address', 'name'],
        componentRestrictions: { country: 'PE' },
        types: ['geocode', 'establishment'],
      });

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          const loc = {
            coordinates: {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
            },
            address: place.formatted_address || place.name || '',
          };
          if (sel === 'origin') {
            store.setOrigin(loc);
            originText.value = loc.address;
          } else {
            store.setDestination(loc);
            destText.value = loc.address;
          }
          store.setActiveSelection(null);
          clearErrors();
        }
      });
    },
    { immediate: true }
  );
});

const useCurrentAsOrigin = async () => {
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
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      })
    );
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const { results } = await new google.maps.Geocoder().geocode({ location: { lat, lng } });
    const address = results[0]?.formatted_address || 'Mi ubicación actual';
    const loc = { coordinates: { latitude: lat, longitude: lng }, address };
    store.setOrigin(loc);
    originText.value = address;
    store.setActiveSelection(null);
    clearErrors();
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
};

function clearErrors() {
  formErrors.value = {};
}

function validateStep(): boolean {
  const errors: Record<string, string> = {};
  if (step.value === 1 && !store.origin) errors.origin = 'Selecciona un origen';
  if (step.value === 2 && !store.destination) errors.destination = 'Selecciona un destino';
  if (step.value === 3 && !store.serviceTypeId) errors.serviceType = 'Selecciona un tipo de servicio';
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
}

function nextStep() {
  if (validateStep()) step.value++;
}

async function handleConfirm() {
  store.setNotes(localNotes.value);
  const ok = await store.confirmTrip();
  if (ok) router.push('/passenger/active-trip');
}
</script>

<style>
.pac-container {
  z-index: 9999 !important;
  margin-top: 4px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  border: 1px solid #e2e8f0;
}

.pac-item {
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
}

.pac-item:hover {
  background-color: #f3f4f6;
}

.pac-item-query {
  font-weight: 600;
}
</style>