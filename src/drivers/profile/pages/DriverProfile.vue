<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- 🧠 Título -->
      <div class="text-center">
        <h1 class="text-2xl md:text-3xl font-extrabold text-yellow-700 tracking-tight">
          👤 Perfil de Conductor
        </h1>
        <p class="text-sm text-yellow-900/70 mt-1">
          Gestiona tu información personal y vehículos
        </p>
      </div>

      <!-- 🧭 Barra de pestañas local -->
      <div class="flex justify-center gap-2 bg-white/60 backdrop-blur-xl border border-yellow-200/40 shadow-inner rounded-full px-2 py-1 w-fit mx-auto">
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
          :class="activeSection === 'profile'
            ? 'bg-yellow-600 text-white shadow-md'
            : 'text-yellow-800 hover:bg-yellow-100/60'"
          @click="activeSection = 'profile'"
        >
          🪪 Perfil
        </button>
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
          :class="activeSection === 'vehicles'
            ? 'bg-yellow-600 text-white shadow-md'
            : 'text-yellow-800 hover:bg-yellow-100/60'"
          @click="activeSection = 'vehicles'"
        >
          🚗 Vehículos
        </button>
      </div>

      <!-- 📄 Contenido con transición -->
      <Transition name="slide-fade" mode="out-in">
        <div
          :key="activeSection"
          class="bg-white/80 backdrop-blur-xl border border-yellow-200/40 shadow-soft rounded-3xl p-6"
        >
          <DriverProfileForm v-if="activeSection === 'profile'" />
          <VehicleManagement v-else />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DriverProfileForm from '../components/DriverProfileForm.vue'
import VehicleManagement from '../components/VehicleManagement.vue'

const activeSection = ref<'profile' | 'vehicles'>('profile')
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
