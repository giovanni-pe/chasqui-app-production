<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';
import { mqttService } from '@/lib/mqtt';
import { useAuthStore } from '@/auth/stores/auth';
import { Icon } from '@iconify/vue';
import VehicleInfo from '../components/VehicleInfo.vue';
import type { DriverOffer, AcceptedOffer } from '../types/index';
import Swal from 'sweetalert2';

interface ChatMessage {
  sender: number;
  role: 'passenger' | 'driver';
  message: string;
  timestamp: string;
}

const store = useActiveTripStore();
const auth = useAuthStore();
const trip = computed(() => store.trip);
const sortedOffers = computed(() => store.sortedOffers);
const minPrice = computed(() => Math.min(...store.sortedOffers.map(o => o.price)) || 0);





const expanded = computed({
  get: () => store.expanded ?? false,
  set: val => (store.expanded = val),
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

const subscribedTopics = new Set<string>();

function sendMessage(driverId: number) {
  const message = store.chatInputs[driverId]?.trim();
  if (!message || !trip.value || !auth.user) return;

  const topic = `chasqui/chat/${trip.value.id}/${driverId}`;
  const payload: ChatMessage = {
    sender: Number(auth.user.id),
    role: 'passenger',
    message,
    timestamp: new Date().toISOString(),
  };

  store.pushChatMessage(driverId, payload);
  mqttService.publish(topic, payload);
  store.clearChatInput(driverId);
}

function acceptDriver(driverId: number) {
  store.acceptDriver(driverId);
}

let stopOffers: (() => void) | null = null;

onMounted(() => {
  if (trip.value) {
    stopOffers = store.listenOffersMqtt(trip.value.id);
  }
});

watch(
  () => store.offers.map(o => o.driverId),
  (driverIds) => {
    if (!trip.value) return;
    for (const driverId of driverIds) {
      const topic = `chasqui/chat/${trip.value.id}/${driverId}`;
      if (!subscribedTopics.has(topic)) {
        mqttService.subscribe(topic, ({ payload }) => {
          const msg = payload as ChatMessage;
          store.pushChatMessage(driverId, msg);
        });
        subscribedTopics.add(topic);
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopOffers?.();
  if (trip.value) {
    subscribedTopics.forEach((topic) => mqttService.unsubscribe(topic));
    subscribedTopics.clear();
  }
});

const vehicleObj = (vehicle: any) => {
  if (!vehicle) return {};
  if (typeof vehicle === 'string') {
    try { vehicle = JSON.parse(vehicle); } catch { return {}; }
  }
  return vehicle;
};
// In your component (DriverOffersPanel.vue or similar)

function onSelectDriverOffer(offer: DriverOffer) {
  if (!store.trip) return;
  store.setAcceptedOffer({
    tripId: store.trip.id,
    driverId: offer.driverId,
    price: offer.price,
    status: 'pending',
    updatedBy: 'passenger',
    updatedAt: Date.now(),
  });
}
function publishNegotiatedOffer() {
  if (!trip.value || !store.acceptedOffer) return;
  store.acceptedOffer.updatedAt = Date.now();
  store.acceptedOffer.updatedBy = 'passenger';
  mqttService.publish(
    `chasqui/trip/${trip.value.id}/accepted_offer`,
    JSON.stringify(store.acceptedOffer)
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
async function acceptDriverPrice() {
  if (!store.acceptedOffer || !store.trip) return;

  // Actualiza local
  store.acceptedOffer.status = 'accepted';
  store.acceptedOffer.updatedBy = 'passenger';
  store.acceptedOffer.updatedAt = Date.now();

  // Publica por MQTT
  mqttService.publish(
    `chasqui/trip/${store.trip.id}/accepted_offer`,
    JSON.stringify({
      ...store.acceptedOffer,
      status: 'accepted',
      updatedBy: 'passenger',
      updatedAt: Date.now(),
    })
  );

  // Feedback al pasajero
  await Swal.fire({
    title: '¡Oferta aceptada!',
    text: 'El conductor será notificado para confirmar el precio negociado.',
    icon: 'success',
    confirmButtonColor: '#10b981',
    confirmButtonText: 'Entendido',
    timer: 2200,
    timerProgressBar: true,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
  });
}

onUnmounted(() => {
  if (trip.value && offerHandler)
    mqttService.unsubscribe(`chasqui/trip/${trip.value.id}/accepted_offer`, offerHandler);
});
</script>

<template>
  <div v-if="trip" class="driver-offers-panel">
    <!-- Estado Minimizado - Más Atractivo -->
    <div v-if="!expanded"
      class=" top-0  left-0 right-0 z-30 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 backdrop-blur-xl border-t border-white/20 shadow-2xl transition-all duration-500 hover:shadow-purple-500/20 cursor-pointer group"
      @click="toggleExpand">
      <!-- Indicador de arrastre -->
      <div class="flex justify-center pt-2 pb-1">
        <div class="w-12 h-1 bg-white/40 rounded-full group-hover:bg-white/60 transition-all duration-300"></div>
      </div>

      <div class="px-4 pb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Icono animado -->
          <div class="relative">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon icon="ph:car-fill" class="text-white text-xl" />
            </div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-white">{{ sortedOffers.length }}</span>
            </div>
            <div class="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          </div>

          <div class="text-white">
            <div class="font-semibold text-sm">
              {{ sortedOffers.length }} conductor{{ sortedOffers.length === 1 ? '' : 'es' }} disponible{{
                sortedOffers.length === 1 ? '' : 's' }}
            </div>
            <div class="text-xs text-white/80" v-if="minPrice !== Infinity">
              Desde <span class="font-bold">S/ {{ minPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="text-white/80 text-xs">Desliza para ver</div>
          <Icon icon="ph:arrow-up-bold" class="text-white text-sm group-hover:animate-bounce" />
        </div>
      </div>
    </div>

    <!-- Estado Expandido - Experiencia Completa -->
    <div v-else class="fixed inset-0 z-40 bg-gradient-to-br from-slate-50 to-indigo-50 overflow-hidden">
      <!-- Header con gradiente -->
      <div class="bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 p-4 pt-16 shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon icon="ph:car-fill" class="text-lg" />
            </div>
            <div>
              <h3 class="text-lg font-bold">Conductores disponibles</h3>
              <p class="text-xs text-white/80">Elige la mejor opción para tu viaje</p>
            </div>
          </div>
          <button @click="toggleExpand"
            class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
            <Icon icon="ph:x-bold" class="text-sm" />
          </button>
        </div>
      </div>

      <!-- Lista de ofertas -->
      <div class="overflow-y-auto p-4 space-y-3 max-h-[70vh]">

        <!-- Estado vacío mejorado -->
        <div v-if="sortedOffers.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
          <div
            class="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <Icon icon="ph:hourglass-medium" class="text-3xl text-blue-600 animate-pulse" />
          </div>
          <h4 class="text-lg font-semibold text-gray-700 mb-2">Buscando conductores...</h4>
          <p class="text-sm text-gray-500">Te notificaremos cuando haya ofertas disponibles</p>
        </div>

        <!-- Cards de ofertas mejoradas -->
        <div v-for="(offer, index) in sortedOffers" :key="offer.driverId"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
          :style="{ animationDelay: `${index * 100}ms` }">
          <!-- Header del conductor -->
          <div class="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {{ offer.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold text-gray-800">{{ offer.name }}</div>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <div class="flex items-center gap-1">
                      <Icon icon="ph:star-fill" class="text-yellow-500" />
                      <span class="font-medium">{{ offer.rating }}</span>
                    </div>
                    <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <VehicleInfo :vehicle="vehicleObj(offer.vehicle)" />
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-600">S/ {{ offer.price.toFixed(2) }}</div>
                <div class="text-xs text-gray-500">por persona</div>
              </div>
            </div>
          </div>

          <!-- Chat mejorado -->
          <div class="p-4 space-y-3">
            <div class="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
              <div v-if="!store.chatMessages[offer.driverId]?.length" class="text-center text-gray-500 text-sm py-2">
                <Icon icon="ph:chat-dots" class="text-lg mb-1" />
                <div>Inicia una conversación</div>
              </div>
              <div v-for="(msg, i) in store.chatMessages[offer.driverId]" :key="i"
                class="flex items-start gap-2 text-sm">
                <div :class="[
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  msg.role === 'passenger' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                ]">
                  {{ msg.role === 'passenger' ? 'T' : 'C' }}
                </div>
                <div class="flex-1 bg-white rounded-lg p-2 shadow-sm">
                  {{ msg.message }}
                </div>
              </div>
            </div>

            <!-- Input de chat mejorado -->
            <form @submit.prevent="sendMessage(offer.driverId)" class="flex gap-2">
              <div class="flex-1 relative">
                <input v-model="store.chatInputs[offer.driverId]" placeholder="Envía un mensaje al conductor..."
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400" />
              </div>
              <button type="submit"
                class="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[40px]"
                :disabled="!store.chatInputs[offer.driverId]?.trim()">
                <Icon icon="ph:paper-plane-tilt-fill" class="text-lg" />
              </button>
            </form>

            <!-- Botón de aceptar mejorado -->
            <!-- Price negotiation area -->
            <div class="flex flex-col gap-2 mt-2">

              <button @click="onSelectDriverOffer(offer)"
                class="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 text-sm font-semibold shadow transition-all">
                Negociar precio
              </button>

              <div v-if="store.acceptedOffer"
                class="p-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 shadow-sm text-center flex flex-col gap-1">
                <div class="text-xs font-bold">
                  Precio negociado:
                  <span class="text-lg font-extrabold text-emerald-600">
                    S/ {{ store.acceptedOffer.price.toFixed(2) }}
                  </span>
                </div>

                <!-- Input+Propose más compacto, en grid -->
                <div class="grid grid-cols-[1fr_auto_auto] gap-1 justify-center items-center">
                  <input v-model.number="store.acceptedOffer.price" type="number" min="1" step="0.1"
                    class="w-16 px-2 py-1 border border-emerald-200 rounded-md text-sm font-bold text-emerald-700 bg-white text-center" />
                  <button @click="publishNegotiatedOffer"
                    class="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold">Proponer</button>
                  <span class="text-[11px] text-gray-400 ml-1">
                    <Icon icon="mdi:reload" class="inline-block mr-0.5" />
                  </span>
                </div>

                <div class="text-xs text-gray-600">
                  Estado:
                  <span :class="{
                    'text-yellow-600': store.acceptedOffer.status === 'pending',
                    'text-green-600': store.acceptedOffer.status === 'accepted',
                    'text-red-600': store.acceptedOffer.status === 'rejected'
                  }">
                    {{ store.acceptedOffer.status.charAt(0).toUpperCase() + store.acceptedOffer.status.slice(1) }}
                  </span>
                  <span v-if="store.acceptedOffer.updatedBy" class="ml-1 text-[10px] text-gray-400">
                    (por {{ store.acceptedOffer.updatedBy }})
                  </span>
                </div>
                <div class="text-[10px] text-gray-400">
                  Actualizado: {{ new Date(store.acceptedOffer.updatedAt).toLocaleTimeString() }}
                </div>
              </div>

              <!-- Botón aceptar, solo si status=pending o accepted por driver -->
              <button v-if="store.acceptedOffer && (
                store.acceptedOffer.status === 'pending' ||
                (store.acceptedOffer.status === 'accepted' && store.acceptedOffer.updatedBy === 'driver')
              )" @click="acceptDriverPrice"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 text-sm shadow transition-all flex items-center justify-center gap-2">
                <Icon icon="ph:check-circle-fill" class="text-base" />
                Aceptar precio S/ {{ store.acceptedOffer?.price?.toFixed(2) ?? '' }}
              </button>
            </div>



          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.driver-offers-panel .bg-white {
  animation: slideUp 0.3s ease-out forwards;
}
</style>