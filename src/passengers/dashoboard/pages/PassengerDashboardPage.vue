<!-- src/passengers/dashboard/pages/PassengerDashboardPage.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import Layout from '@/ui/Layout.vue';
import Loading from '@/ui/Loading.vue';
import Button from '@/ui/Button.vue';
import { useAuth } from '@/auth/composables/useAuth';
import { usePassengerDashboard } from '../composables/usePassengerDashboard';
import PassengerDashboardSummary from '../components/PassengerDashboardSummary.vue';
import PassengerMobileNav from '../components/PassengerMobileNav.vue';

const { user } = useAuth();
const {
  passengerStats,
  passengerLoading,
  passengerError,
  clearPassengerError,
  reloadPassengerDashboard,
} = usePassengerDashboard();

// TODO: reemplazar por lógica real de viaje activo
const hasActiveTrip = computed(() => false);
</script>

<template>
  <!-- Loading -->
  <Loading
    v-if="passengerLoading"
    fullScreen
    text="Loading passenger dashboard..."
  />

  <!-- Error -->
  <div
    v-else-if="passengerError"
    class="min-h-screen bg-gray-50 flex items-center justify-center"
  >
    <div class="text-center px-4">
      <p class="text-red-600 mb-4">{{ passengerError }}</p>
      <Button @click="() => { clearPassengerError(); reloadPassengerDashboard(); }">
        Try Again
      </Button>
    </div>
  </div>

  <!-- Contenido principal -->
  <div v-else>
    <Layout>
      <!-- Header personalizado -->
      <div class="flex items-center justify-between p-4 bg-white border-b">
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            Hi, {{ user?.first_name }}! 👋
          </h1>
          <p class="text-sm text-gray-600">Where to today?</p>
        </div>
        <Button variant="ghost" size="sm" @click="reloadPassengerDashboard">
          🔄
        </Button>
      </div>

      <!-- Body -->
      <div class="pb-20">
        <div class="p-4 space-y-6">
          <PassengerDashboardSummary
            v-if="passengerStats"
            :stats="passengerStats"
          />
        </div>
      </div>
    </Layout>

    <!-- Navegación móvil -->
    <PassengerMobileNav :hasActiveTrip="hasActiveTrip" />
  </div>
</template>
