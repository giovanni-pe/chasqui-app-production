<template>
  <Layout>
    <div class="min-h-screen px-4 py-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/20">
      <!-- Título -->
      <div class="text-center mb-2">
        <h1 class="text-2xl font-extrabold text-yellow-800 tracking-tight">Mis Ganancias</h1>
        <p class="text-sm text-yellow-700">Revisa tu rendimiento como conductor</p>
      </div>

      <!-- Estados de carga o error -->
      <div v-if="store.loading && !store.summary" class="text-center text-sm text-gray-500">
        ⏳ Cargando ganancias...
      </div>

      <div v-else-if="store.error" class="text-center text-sm text-red-600">
        {{ store.error }}
      </div>

      <!-- Contenido principal -->
      <div v-else class="space-y-4 max-w-2xl mx-auto">
        <EarningsCard v-if="store.summary" :summary="store.summary" />
        <EarningsChart v-if="store.records.length" :data="store.records" />
      </div>
    </div>

    <!-- Barra inferior móvil -->
    <DriverMobileNav :hasActiveTrip="dashboardStore.hasActiveTrip" />
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/ui/Layout.vue'
import EarningsCard from '../components/EarningsCard.vue'
import EarningsChart from '../components/EarningsChart.vue'

import DriverMobileNav from '@/drivers/dashboard/components/DriverMobileNav.vue'

import { useEarningsStore } from '../store/earningsStore'
import { useDriverDashboardStore } from '@/drivers/dashboard/store/driverDashboardStore'
import { onMounted } from 'vue'

const store = useEarningsStore()
const dashboardStore = useDriverDashboardStore()

onMounted(() => {
  store.fetchSummary()
  store.fetchRecords()
})
</script>
