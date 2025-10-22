<template>
  <Layout>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/20 px-4 py-6 space-y-6">
      <!-- Título principal -->
      <div class="text-center mb-4">
        <h1 class="text-2xl font-extrabold text-yellow-800 tracking-tight flex items-center justify-center gap-2">
          <Icon icon="mdi:steering" class="text-yellow-700 text-2xl" />
          Panel del Conductor
        </h1>
        <p class="text-sm text-yellow-700">Monitorea tu progreso y maximiza tus ganancias</p>
      </div>

      <!-- Banner motivacional superior -->
      <div
        class="relative px-5 py-4 rounded-2xl bg-gradient-to-r from-yellow-100 via-white to-yellow-50 border border-yellow-200/50 shadow-inner flex items-center gap-4 overflow-hidden"
      >
        <Icon icon="mdi:taxi" class="text-yellow-600 text-3xl flex-shrink-0 animate-bounce-slow" />
        <div class="relative h-6 overflow-hidden w-full">
          <TransitionGroup name="fade" tag="div">
            <div
              :key="currentMessage"
              class="absolute w-full inset-0 text-sm md:text-base font-medium text-yellow-900 text-center"
            >
              {{ currentMessage }}
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- Resumen de hoy -->
      <TodayEarnings />

      <!-- CTA principal -->
      <div
      
        class="relative bg-gradient-to-br from-yellow-50 via-white to-yellow-100 border border-yellow-100 rounded-2xl p-5 shadow-sm text-center space-y-4"
      >
        <div class="absolute top-2 left-2">
          <span
            class="text-xs bg-purple-600 text-white font-semibold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1"
          >
            <Icon icon="mdi:sparkles" class="text-white text-sm" />
            ¡Nuevo!
          </span>
        </div>

        <div class="mt-4 space-y-2 relative z-10">
          <h3 class="text-base font-semibold text-gray-800">¿Listo para tu próximo pasajero?</h3>
          <p class="text-sm text-gray-600">
            Comienza a recibir viajes con solo un toque.
          </p>

          <button
            @click="navigate('/driver/trip-request')"
            class="relative inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md hover:scale-105 transition-transform duration-300"
          >
            <span class="absolute inset-0 bg-yellow-400/20 blur-xl rounded-xl animate-shine" />
            <Icon icon="mdi:car-arrow-right" class="text-lg" />
            Empezar a ganar
          </button>
        </div>
      </div>

      <!-- CTA secundaria: Ganancias detalladas -->
      <div
        class="mt-4 px-4 py-3 rounded-xl bg-yellow-50/60 border border-yellow-100 text-yellow-900 text-sm flex items-center justify-between hover:bg-yellow-100/70 transition cursor-pointer"
        @click="navigate('/driver/earnings')"
      >
        <div class="flex items-center gap-2">
          <Icon icon="mdi:chart-line" class="text-yellow-700 text-lg" />
          <div class="flex flex-col leading-tight">
            <span class="font-medium">Consulta tus ingresos detallados</span>
            <span class="text-xs text-yellow-800">Y descubre cómo mejorar tu rendimiento</span>
          </div>
        </div>
        <Icon icon="mdi:chevron-right" class="text-yellow-600 text-xl" />
      </div>
    </div>
  </Layout>

  <DriverMobileNav :hasActiveTrip="dashboardStore.hasActiveTrip" />
</template>

<script setup lang="ts">
import Layout from '@/ui/Layout.vue'
import TodayEarnings from '../components/TodayEarnings.vue'
import DriverMobileNav from '../components/DriverMobileNav.vue'
import { useNavigation } from '@/router/useNavigation'
import { useDriverDashboardStore } from '../store/driverDashboardStore'
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'

const { navigate } = useNavigation()
const dashboardStore = useDriverDashboardStore()

const messages = [
  '¡Orgullo de ser taxista, motor de la ciudad!',
  'Tú conoces las calles mejor que nadie.',
  'Cada carrera es un paso hacia tus metas.',
  'Madrugas por tu familia. Eso es grande.',
  'La calle te respeta. Tú haces que se mueva.',
  'Tu volante lleva historias, sueños y futuro.',
  'Con cada viaje demuestras que el trabajo dignifica.',
  'Hoy una carrera más, mañana una vida mejor.',
  'Sin ti, nadie llega a tiempo. Tú marcas el ritmo.',
  'En cada semáforo, estás construyendo progreso.'
]

const currentMessageIndex = ref(0)
const currentMessage = ref(messages[0])

onMounted(() => {
  setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
    currentMessage.value = messages[currentMessageIndex.value]
  }, 1800000) // 30 minutos en milisegundos
})
</script>

<style scoped>
@keyframes shine {
  0% { transform: translateX(-100%); opacity: 0.1; }
  50% { transform: translateX(100%); opacity: 0.3; }
  100% { transform: translateX(150%); opacity: 0; }
}
.animate-shine {
  animation: shine 2.5s ease-in-out infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>