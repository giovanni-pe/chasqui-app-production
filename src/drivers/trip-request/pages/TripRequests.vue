<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800 relative overflow-hidden">
    <!-- Fondo decorativo -->
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full blur-3xl"></div>
    </div>

    <!-- Contenido principal -->
    <div class="relative z-10 pt-16">
      <!-- Encabezado mejorado -->
      <header class="backdrop-blur-sm bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div class="max-w-xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-75"></div>
                <div class="relative bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-xl shadow-lg">
                  <Icon icon="mdi:taxi" class="text-2xl text-white" />
                </div>
              </div>
              <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  ChasquiX
                </h1>
                <p class="text-xs text-gray-500 font-medium">Panel de Conductor</p>
              </div>
            </div>
            
            <!-- Estado del conductor -->
            <DriverStatus class="scale-90" />
          </div>
          
          <!-- Slogan -->
          <div class="mt-3 text-center">
            <p class="text-sm text-gray-600 font-medium italic flex items-center justify-center gap-1">
              <span>Tu compromiso mueve al Perú</span>
              <span class="text-base">🇵🇪</span>
            </p>
          </div>
        </div>
      </header>

      <!-- Contenido principal -->
      <main class="max-w-xl mx-auto px-6 py-8 space-y-6">
        <!-- Tarjeta de solicitudes -->
        <div class="backdrop-blur-sm bg-white/60 rounded-2xl shadow-xl border border-white/20 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Icon icon="mdi:clock-outline" class="text-white text-lg" />
            </div>
            <h2 class="text-lg font-semibold text-gray-800">Solicitudes de Viaje</h2>
          </div>
          <RequestsList />
        </div>

        <!-- Tarjeta de estadísticas rápidas -->
    
      </main>
    </div>

    <!-- Mensajes motivacionales flotantes mejorados -->
    <div class="fixed bottom-6 left-6 right-6 z-50">
      <transition-group name="slide-up" tag="div" class="space-y-2">
        <div 
          v-for="(msg, i) in messages" 
          :key="i" 
          v-show="currentMsgIndex === i"
          class="backdrop-blur-md bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
            <span class="text-yellow-300 animate-pulse">🌟</span>
            <span>{{ msg }}</span>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Indicadores de conectividad -->
    <div class="fixed top-4 right-4 z-40">
      <div class="flex items-center gap-2 backdrop-blur-sm bg-white/80 px-3 py-2 rounded-full shadow-lg border border-white/20">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-xs font-medium text-gray-700">En línea</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import RequestsList from '../components/RequestsList.vue';
import DriverStatus from '@/drivers/status/components/DriverStatus.vue';

const messages = [
  'Cada kilómetro es una historia.',
  'Un buen taxista guía con el volante y con el corazón.',
  '¡Gracias por llevar al Perú adelante!',
  'El motor del cambio eres tú.',
  'Conduce con orgullo, protege con respeto.',
];

const currentMsgIndex = ref(0);

onMounted(() => {
  setInterval(() => {
    currentMsgIndex.value = (currentMsgIndex.value + 1) % messages.length;
  }, 6000);
});
</script>

<style scoped>
/* Transiciones mejoradas */
.slide-up-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Animaciones personalizadas */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Efectos de glassmorphism */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Hover effects */
.backdrop-blur-sm:hover {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: backdrop-filter 0.3s ease;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
</style>