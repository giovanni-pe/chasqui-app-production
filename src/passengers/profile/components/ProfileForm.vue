<template>
  <Card class="mx-auto w-full max-w-md bg-gradient-to-br from-white/90 to-blue-50/60 backdrop-blur-2xl border border-blue-100/50 rounded-3xl shadow-mid p-6 space-y-6">
    <h2 class="text-2xl font-semibold text-gray-900 text-center">Perfil de pasajero</h2>

    <div v-if="store.error" class="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg">
      <Icon icon="mdi:alert-circle-outline" class="w-5 h-5" />
      <span>{{ store.error }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nombre -->
      <label class="block relative">
        <Icon icon="mdi:account" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="form.first_name"
          placeholder="Nombre"
          class="input-field"
        />
      </label>

      <!-- Apellido -->
      <label class="block relative">
        <Icon icon="mdi:account-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="form.last_name"
          placeholder="Apellido"
          class="input-field"
        />
      </label>

      <!-- Email -->
      <label class="block relative">
        <Icon icon="mdi:email-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="form.email"
          type="email"
          placeholder="Correo electrónico"
          class="input-field"
        />
      </label>

      <!-- Teléfono -->
      <label class="block relative">
        <Icon icon="mdi:phone-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="form.phone"
          placeholder="Teléfono"
          class="input-field"
        />
      </label>

      <!-- Botón toggle contacto emergencia -->
      <button type="button" @click="showEmergency = !showEmergency" class="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900">
        <span>{{ showEmergency ? 'Ocultar contacto de emergencia' : 'Mostrar contacto de emergencia' }}</span>
        <Icon icon="mdi:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showEmergency }" />
      </button>

      <!-- Contacto emergencia -->
      <div v-if="showEmergency" class="space-y-4 pt-2">
        <label class="block relative">
          <Icon icon="mdi:account-heart-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.emergency_contact_name"
            placeholder="Nombre contacto"
            class="input-field"
          />
        </label>

        <label class="block relative">
          <Icon icon="mdi:phone-plus-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="form.emergency_contact_phone"
            placeholder="Teléfono contacto"
            class="input-field"
          />
        </label>
      </div>

      <!-- Botón guardar -->
      <Button
        type="submit"
        :loading="store.loading"
        class="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
      >
        <Icon :icon="store.loading ? 'mdi:loading' : 'mdi:content-save-outline'" class="w-5 h-5 mr-2" :class="{ 'animate-spin': store.loading }" />
        Guardar cambios
      </Button>
    </form>
  </Card>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch, ref } from 'vue'
import { usePassengerProfileStore } from '../store/passengerProfileStore'
import { Icon } from '@iconify/vue';

import Card from '@/ui/Card.vue'
import Button from '@/ui/Button.vue'


const store = usePassengerProfileStore()

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
})

const showEmergency = ref(false)

onMounted(() => {
  store.fetchProfile()
})

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      form.first_name = profile.first_name || ''
      form.last_name = profile.last_name || ''
      form.email = profile.email || ''
      form.phone = profile.phone || ''
      form.emergency_contact_name = profile.emergency_contact_name || ''
      form.emergency_contact_phone = profile.emergency_contact_phone || ''
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  store.clearError()
  await store.updateProfile({ ...form })
}
</script>

<style scoped>
.input-field {
  @apply w-full pl-10 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200;
}
</style>
