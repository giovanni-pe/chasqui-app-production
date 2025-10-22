<script setup lang="ts">
import { computed, reactive, ref, watch, nextTick, onUnmounted } from 'vue';
import { useTripRequestsStore } from '../stores/useTripRequestsStore';
import { useGeolocation } from '@/lib/composables/useGeolocation';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/auth/stores/auth';
import { mqttService } from '@/lib/mqtt';
import Swal from 'sweetalert2';

const auth = useAuthStore();
const store = useTripRequestsStore();
const { position, error: geoErr } = useGeolocation();

const trip = computed(() => store.selectedTrip);
const visible = computed(() => store.drawerVisible);
const messages = computed(() => store.chatMessages);

const msgInput = ref('');
const hasPostulated = ref(false);
const state = reactive({ offer: trip.value?.estimated_fare ?? 0 });
const isTyping = ref(false);
const showChat = ref(false);

const chatContainer = ref<HTMLDivElement | null>(null);

// Computed property for status text
const statusText = computed(() => {
  if (!store.acceptedOffer) return '';
  switch (store.acceptedOffer.status) {
    case 'pending':
      return 'Pendiente';
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    default:
      return store.acceptedOffer.status;
  }
});

watch(trip, t => {
  if (t) {
    state.offer = t.estimated_fare;
    hasPostulated.value = false;
    showChat.value = false;
  }
});


watch(messages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
});

async function geoErrCheck() {
  if (geoErr.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Error de GPS',
      text: `⚠️ GPS: ${geoErr.value}`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f59e42'
    });
    return true;
  }
  if (!position.value) {
    await Swal.fire({
      icon: 'info',
      title: 'Ubicación requerida',
      text: '⌛ Obteniendo ubicación…',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#38bdf8'
    });
    return true;
  }
  return false;
}

async function postulate() {
  if (!trip.value || await geoErrCheck()) return;

  store.postulate(trip.value, state.offer, {
    latitude: position.value!.latitude,
    longitude: position.value!.longitude,
  });
  if (!store.acceptedOffer) {
    if (!auth.user) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no autenticado',
        text: 'No se pudo obtener la información del usuario autenticado.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Cerrar'
      });
      return;
    }
    store.acceptedOffer = {
      tripId: trip.value.id,
      driverId: Number(auth.user.id),
      price: 20,
      status: 'pending',
      updatedBy: 'driver',
      updatedAt: Date.now(),
    };
  } else {
    // Update values if already initialized
    store.acceptedOffer.price = store.acceptedOffer.price || trip.value.estimated_fare;
    store.acceptedOffer.status = 'pending';
    store.acceptedOffer.updatedBy = 'driver';
    store.acceptedOffer.updatedAt = Date.now();
  }

  hasPostulated.value = true;
}

async function accept() {
  if (!trip.value) return;
  if (!store.acceptedOffer || typeof store.acceptedOffer.price !== 'number') {
    await Swal.fire({
      icon: 'warning',
      title: 'Oferta no válida',
      text: 'No hay oferta seleccionada o el precio es inválido.',
      confirmButtonText: 'Entendido'
    });
    return;
  }
  const price = store.acceptedOffer.price;
  if (price <= 0 || isNaN(price)) {
    await Swal.fire({
      icon: 'warning',
      title: 'Precio inválido',
      text: 'El precio de la oferta debe ser mayor a 0.',
      confirmButtonText: 'Entendido'
    });
    return;
  }
  store.acceptRequest(trip.value.id, price);
  store.closeDrawer();
}



function reject() {
  if (trip.value) store.rejectRequest(trip.value.id);
  store.closeDrawer();
}

function send() {
  const txt = msgInput.value.trim();
  if (!txt) return;
  store.sendChatMessage(txt);
  msgInput.value = '';
}

function toggleChat() {
  showChat.value = !showChat.value;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short'
  });
}


function publishNegotiatedOffer() {
  if (!trip.value || !store.acceptedOffer) return;
  const payload = {
    ...store.acceptedOffer,
    updatedAt: Date.now(),
    updatedBy: 'driver',
  };
  mqttService.publish(
    `chasqui/trip/${trip.value.id}/accepted_offer`,
    JSON.stringify(payload)
  );
}
let offerHandler: any = null;

watch(trip, (tripVal) => {
  if (!tripVal) return;
  // Primero desuscribimos el anterior si hay
  if (offerHandler) mqttService.unsubscribe(`chasqui/trip/${tripVal.id}/accepted_offer`, offerHandler);

  offerHandler = ({ payload }: any) => {
    let data = payload;
    // Si llega como string, parsea
    if (typeof payload === 'string') data = JSON.parse(payload);
    if (data.tripId !== tripVal.id) return; // Seguridad por si se cruza algún topic
    // Solo actualiza si el mensaje viene de la otra parte
    if (!store.acceptedOffer || data.updatedAt > store.acceptedOffer.updatedAt) {
      store.acceptedOffer = { ...data };
    }
  };

  mqttService.subscribe(`chasqui/trip/${tripVal.id}/accepted_offer`, offerHandler);
}, { immediate: true });
onUnmounted(() => {
  if (trip.value && offerHandler)
    mqttService.unsubscribe(`chasqui/trip/${trip.value.id}/accepted_offer`, offerHandler);
});
watch(
  () => store.acceptedOffer && store.acceptedOffer.status === 'accepted' && store.acceptedOffer.updatedBy === 'passenger',
  (shouldShow) => {
    if (shouldShow) {
      Swal.fire({
        icon: 'success',
        title: '¡El pasajero ha aceptado tu oferta!',
        text: 'Ahora puedes aceptar o rechazar el viaje.',
        confirmButtonText: 'Entendido',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: true,
      });
    }
  }
);
</script>

<template>
  <transition name="slide" enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-300 ease-in" enter-from-class="transform translate-x-full"
    leave-to-class="transform translate-x-full">
    <aside v-if="visible"
      class="fixed inset-0 z-1 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 sm:right-0 sm:left-auto sm:w-96 flex flex-col">

      <!-- Header -->
      <header class="bg-white/90 backdrop-blur-xl border-b border-white/30 shadow-sm pt-2">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 class="text-lg font-semibold text-gray-800">Solicitud de viaje</h2>
          </div>
          <button @click="store.closeDrawer"
            class="w-9 h-9 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200">
            <Icon icon="mdi:close" class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div v-if="trip" class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-4">

          <!-- Passenger Info -->
          <div
            class="bg-white/80 backdrop-blur-xl rounded-xl border border-white/30 shadow p-2 flex flex-col gap-2 max-w-sm mx-auto">
            <!-- Pasajero -->
            <div class="flex items-center gap-2">
              <div
                class="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:account" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-gray-800 text-sm truncate">{{ trip.passenger_name }}</div>
                <div class="flex items-center gap-1 text-[11px] text-gray-500">
                  <span>ID: {{ trip.passenger_id }}</span>
                  <span class="flex items-center gap-0.5">
                    <Icon icon="mdi:star" class="w-3.5 h-3.5 text-yellow-400" />
                    {{ trip.passenger_rating }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Rutas -->
            <div class="space-y-1">
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <div
                  class="text-xs text-gray-600 overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 hover:underline"
                  style="max-width: 80vw;" :title="trip.pickup_address">{{ trip.pickup_address }}</div>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div
                  class="text-xs text-gray-600 overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 hover:underline"
                  style="max-width: 80vw;" :title="trip.destination_address">{{ trip.destination_address }}</div>
              </div>
              <!-- Detalles viaje -->
              <div class="grid grid-cols-3 gap-2 text-[11px] mb-2">
                <div class="text-center p-1.5 bg-gray-50 rounded-lg">
                  <Icon icon="mdi:clock-outline" class="w-4 h-4 text-purple-500 mx-auto mb-0.5" />
                  <div class="font-semibold text-purple-600">{{ trip.estimated_duration }}min</div>
                  <div class="text-[10px] text-gray-500">Tiempo</div>
                </div>
                <div class="text-center p-1.5 bg-gray-50 rounded-lg">
                  <Icon icon="mdi:map-marker-distance" class="w-4 h-4 text-emerald-500 mx-auto mb-0.5" />
                  <div class="font-semibold text-emerald-600">{{ trip.estimated_distance }}km</div>
                  <div class="text-[10px] text-gray-500">Distancia</div>
                </div>
                <div class="text-center p-1.5 bg-gray-50 rounded-lg">
                  <Icon icon="mdi:motorbike" class="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                  <div class="font-semibold text-orange-600">{{ trip.service_type }}</div>
                  <div class="text-[10px] text-gray-500">Servicio</div>
                </div>
              </div>

              <!-- Fechas -->
              <div class="flex justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                <span>Creado: {{ formatTime(trip.created_at) }}</span>
                <span v-if="trip.expires_at" class="text-red-500 font-semibold">Expira: {{ formatTime(trip.expires_at)
                }}</span>
              </div>
            </div>
          </div>


          <!-- Pricing & Metrics -->
          <div class="bg-white/80 backdrop-blur-xl rounded-xl border border-white/30 shadow-md p-2 max-w-sm mx-auto">
            <!-- Tarifas -->
            <div class="mb-2">
              <div class="text-xs font-bold text-gray-700 mb-1">Tarifas</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-sky-50 rounded-lg py-2 text-center">
                  <Icon icon="mdi:calculator-variant" class="w-4 h-4 text-sky-600 mx-auto mb-0.5" />
                  <div class="text-base font-bold text-sky-700">S/ {{ Number(trip.estimated_fare).toFixed(2) }}</div>
                  <div class="text-[10px] text-sky-600">Estimado</div>
                </div>
                <div class="bg-yellow-50 rounded-lg py-2 text-center">
                  <Icon icon="mdi:hand-coin" class="w-4 h-4 text-yellow-600 mx-auto mb-0.5" />
                  <div class="text-base font-bold text-yellow-700">S/ {{ Number(trip.passenger_max_fare).toFixed(2) }}
                  </div>
                  <div class="text-[10px] text-yellow-600">Máximo</div>
                </div>
              </div>
            </div>

            <!-- Oferta -->
            <div v-if="!hasPostulated" class="bg-white/70 rounded-xl border border-white/30 shadow p-2 mb-2">
              <div class="text-xs font-bold text-gray-700 mb-1">Tu oferta</div>
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">S/</span>
                  <input v-model.number="state.offer" type="number" min="1" step="0.1"
                    class="w-full pl-7 pr-2 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 text-center text-base font-semibold" />
                </div>
                <button @click="postulate"
                  class="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow">
                  Postular
                </button>
              </div>
            </div>

            <!-- Postulado acciones -->
            <div v-if="hasPostulated" class="flex flex-col items-center gap-3 my-2">

              <!-- Negotiation Area -->
              <div v-if="store.acceptedOffer"
                class="w-full px-3 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 shadow-sm text-center">
                <div class="font-semibold text-xs mb-0.5">
                  Precio negociado:
                  <span class="text-base font-bold text-emerald-600">
                    S/ {{ store.acceptedOffer.price.toFixed(2) }}
                  </span>
                </div>
                <!-- Edit price + Propose button -->
                <div class="flex items-center justify-center gap-2 mt-2 mb-1">
                  <input v-model.number="store.acceptedOffer.price" @keydown.enter="publishNegotiatedOffer"
                    @blur="publishNegotiatedOffer" type="number" min="1" step="0.1"
                    class="w-20 px-2 py-1 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-bold bg-white text-center" />
                  <button @click="publishNegotiatedOffer"
                    class="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold">
                    Proponer
                  </button>
                </div>
                <!-- Estado de oferta -->
                <div class="flex justify-center items-center gap-2 text-[12px] text-gray-600">
                  Estado:
                  <span :class="{
                    'text-yellow-600': store.acceptedOffer.status === 'pending',
                    'text-green-600': store.acceptedOffer.status === 'accepted',
                    'text-red-600': store.acceptedOffer.status === 'rejected'
                  }">
                    {{ statusText }}
                  </span>
                  <span v-if="store.acceptedOffer.updatedBy" class="text-gray-400 ml-1">
                    (por {{ store.acceptedOffer.updatedBy }})
                  </span>
                </div>
                <div class="text-[10px] text-gray-400 mt-1">
                  Última actualización: {{ new Date(store.acceptedOffer.updatedAt).toLocaleTimeString() }}
                </div>
              </div>

              <!-- Acciones de aceptar/rechazar solo cuando el pasajero acepta -->
              <div v-if="store.acceptedOffer
                && store.acceptedOffer.status === 'accepted'
                && store.acceptedOffer.updatedBy === 'passenger'" class="flex flex-row gap-2 w-full mt-1">
                <button @click="accept"
                  class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow">
                  Aceptar viaje
                </button>
                <button @click="reject"
                  class="flex-1 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold shadow">
                  Rechazar
                </button>
              </div>
            </div>


          </div>



        </div>
      </div>

      <!-- Chat Toggle Button -->
      <div class="p-2 bg-white/90 backdrop-blur-xl border-t border-white/30">
        <button @click="toggleChat"
          class="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
          <div class="flex items-center space-x-2">
            <Icon icon="mdi:chat" class="w-5 h-5" />
            <span class="font-medium">Chat con pasajero</span>
            <div v-if="messages.length > 0" class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <Icon :icon="showChat ? 'mdi:chevron-down' : 'mdi:chevron-up'" class="w-5 h-5" />
        </button>
      </div>

      <!-- Chat Panel (WhatsApp Style) -->
      <transition name="slide-up" enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-in" enter-from-class="transform translate-y-full opacity-0"
        leave-to-class="transform translate-y-full opacity-0">
        <div v-if="showChat" class="absolute inset-0 bg-white/95 backdrop-blur-xl z-60 flex flex-col">
          <!-- Chat Header -->
          <header class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 pt-20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-semibold">{{ trip?.passenger_name }}</h3>
                  <p class="text-xs text-blue-100">En línea</p>
                </div>
              </div>
              <button @click="toggleChat"
                class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200">
                <Icon icon="mdi:close" class="w-5 h-5" />
              </button>
            </div>
          </header>

          <!-- Messages -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div v-for="(m, i) in messages" :key="i"
              :class="m.role === 'driver' ? 'flex justify-end' : 'flex justify-start'">
              <div :class="[
                'max-w-xs px-4 py-2 rounded-2xl shadow-sm',
                m.role === 'driver'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border'
              ]">
                <p class="text-sm">{{ m.message }}</p>
                <p class="text-xs opacity-70 mt-1">{{ formatTime(m.timestamp || new Date().toISOString()) }}</p>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="bg-white border-t border-gray-200 p-4">
            <form @submit.prevent="send" class="flex space-x-3">
              <input v-model="msgInput" placeholder="Escribe un mensaje..."
                class="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200" />
              <button type="submit" :disabled="!msgInput.trim()"
                class="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
                <Icon icon="mdi:send" class="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </transition>
    </aside>
  </transition>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Smooth transitions */
* {
  transition-property: transform, background-color, border-color, color, fill, stroke, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>