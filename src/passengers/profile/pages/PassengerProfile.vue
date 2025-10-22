<template>
  <Layout
    header-title="Mi perfil"
    show-back
    @back="goBack"
    class="max-w-3xl mx-auto p-6 space-y-8"
  >
    <!-- Navegación interna -->
    <div class="flex gap-4 border-b pb-2">
      <button
        class="px-4 py-2 font-semibold rounded-t-md"
        :class="activeTab === 'profile'
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-blue-600'"
        @click="activeTab = 'profile'"
      >
        👤 Perfil
      </button>
      <button
        class="px-4 py-2 font-semibold rounded-t-md"
        :class="activeTab === 'locations'
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-blue-600'"
        @click="activeTab = 'locations'"
      >
        📍 Ubicaciones
      </button>
    </div>

    <!-- Contenido -->
    <div>
      <ProfileForm v-if="activeTab === 'profile'" />
      <SavedLocations v-else />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Layout from '@/ui/Layout.vue'
import ProfileForm from '../components/ProfileForm.vue'
import SavedLocations from '../components/SavedLocations.vue'
import { useNavigation } from '@/router/useNavigation'

const { goBack } = useNavigation()
const activeTab = ref<'profile' | 'locations'>('profile')
</script>
