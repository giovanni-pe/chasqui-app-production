<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import Card from '@/ui/Card.vue';
import Button from '@/ui/Button.vue';
import { formatCurrency } from '@/lib/utils';
import { useNavigation } from '@/router/useNavigation';
import type { PassengerDashboardStats } from '../types';

interface Props {
  stats: PassengerDashboardStats;
}

const props = defineProps<Props>();
const { navigate } = useNavigation();

/** Valor formateado de gasto total */
const formattedTotal = computed(() => formatCurrency(props.stats.total_spent));
</script>

<template>
  <div class="space-y-8">
    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Viajes Totales -->
      <Card hover class="relative flex flex-col items-center p-4 text-center">
        <Icon
          icon="mdi:car-multiple"
          class="w-6 h-6 text-sky-500 mb-1 animate-float"
        />
        <div class="text-3xl font-bold text-sky-600">{{ props.stats.total_trips }}</div>
        <div class="text-sm text-gray-600">Viajes Totales</div>
        <div class="absolute top-2 right-2 bg-white/60 backdrop-blur-xs rounded-full p-1">
          <Icon
            icon="mdi:information-outline"
            class="w-4 h-4 text-gray-500 hover:text-sky-600"
          />
        </div>
      </Card>

      <!-- Gastado Total -->
      <Card hover class="relative flex flex-col items-center p-4 text-center">
        <Icon
          icon="mdi:currency-usd-circle"
          class="w-6 h-6 text-green-500 mb-1 animate-float"
        />
        <div class="text-3xl font-bold text-green-600">
          {{ formattedTotal }}
        </div>
        <div class="text-sm text-gray-600">Gastado Total</div>
        <div class="absolute top-2 right-2 bg-white/60 backdrop-blur-xs rounded-full p-1">
          <Icon
            icon="mdi:information-outline"
            class="w-4 h-4 text-gray-500 hover:text-green-600"
          />
        </div>
      </Card>
    </div>

    <!-- Acción Principal -->
    <Card class="relative flex flex-col items-center p-6 text-center bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-glam">
      <div class="relative">
        <Icon
          icon="mdi:rocket-launch"
          class="w-12 h-12 text-cyan-500 mb-2 animate-pulse"
        />
        <div
          class="absolute top-0 -right-4 bg-gradient-to-r from-violet-500 to-purple-500
                 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse"
        >
          ¡Nuevo!
        </div>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">
        ¿Listo para tu próximo viaje?
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Reserva tu traslado en solo unos toques
      </p>
      <Button
        size="lg"
        fullWidth
        class="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex items-center justify-center"
        @click="navigate('/passenger/trip-request')"
      >
        <Icon icon="mdi:map-marker-plus" class="w-5 h-5 mr-2" />
        Solicitar viaje
      </Button>
    </Card>

    <!-- Estadísticas secundarias -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Tu Calificación -->
      <Card hover class="relative flex flex-col items-center p-4 text-center">
        <Icon
          icon="mdi:star-circle"
          class="w-6 h-6 text-amber-500 mb-1 animate-float"
        />
        <div class="text-2xl font-semibold text-orange-600">
          {{ props.stats.averageRating }} / 5
        </div>
        <div class="text-sm text-gray-600">Tu calificación</div>
        <div class="absolute top-2 left-2 bg-white/60 backdrop-blur-xs rounded-full p-1">
          <Icon
            icon="mdi:information-outline"
            class="w-4 h-4 text-gray-500 hover:text-orange-600"
          />
        </div>
      </Card>

      <!-- Lugares Guardados -->
      <Card hover class="relative flex flex-col items-center p-4 text-center">
        <Icon
          icon="mdi:map-marker-star"
          class="w-6 h-6 text-purple-600 mb-1 animate-float"
        />
        <div class="text-2xl font-semibold text-purple-600">
          {{ props.stats.savedLocations }}
        </div>
        <div class="text-sm text-gray-600">Lugares guardados</div>
        <div class="absolute top-2 left-2 bg-white/60 backdrop-blur-xs rounded-full p-1">
          <Icon
            icon="mdi:information-outline"
            class="w-4 h-4 text-gray-500 hover:text-purple-600"
          />
        </div>
      </Card>
    </div>
  </div>
</template>
