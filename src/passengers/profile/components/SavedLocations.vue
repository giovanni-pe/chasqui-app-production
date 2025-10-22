<template>
  <Card class="mx-auto w-full max-w-lg bg-gradient-to-br from-white/90 to-blue-50/60 backdrop-blur-2xl border border-blue-100/50 rounded-3xl shadow-mid p-6 space-y-6">
    <h2 class="text-2xl font-semibold text-gray-900 text-center">📍 Ubicaciones guardadas</h2>

    <!-- Toggle form -->
    <button
      type="button"
      @click="toggleForm"
      class="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
    >
      <span>{{ showForm ? 'Cancelar' : 'Agregar nueva ubicación' }}</span>
      <Icon :icon="showForm ? 'mdi:chevron-down' : 'mdi:chevron-down'" class="w-5 h-5 transform transition-transform" :class="{ 'rotate-180': showForm }" />
    </button>

    <!-- Error -->
    <div v-if="error" class="flex items-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg">
      <Icon icon="mdi:alert-circle-outline" class="w-5 h-5" />
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <form v-if="showForm" @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block relative">
          <Icon icon="mdi:label-outline" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input v-model="form.name" name="name" placeholder="Nombre" class="input-field" />
        </label>
        <label class="block relative col-span-1 sm:col-span-2">
          <Icon icon="mdi:map-marker-outline" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input v-model="form.address" name="address" placeholder="Dirección" class="input-field" />
        </label>
        <label class="block relative">
          <Icon icon="mdi:latitude" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input v-model="form.latitude" name="latitude" placeholder="Latitud" class="input-field" />
        </label>
        <label class="block relative">
          <Icon icon="mdi:longitude" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input v-model="form.longitude" name="longitude" placeholder="Longitud" class="input-field" />
        </label>
      </div>

      <Button type="submit" :loading="loading" class="btn-gradient">
        <Icon icon="mdi:plus-box-outline" class="w-5 h-5 mr-2" />
        Agregar ubicación
      </Button>
    </form>

    <!-- Listado -->
    <div class="space-y-4">
      <template v-if="savedLocations.length > 0">
        <div v-for="loc in savedLocations" :key="loc.id" class="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 transition-shadow hover:shadow-soft">
          <div class="flex-1 min-w-0 space-y-1">
            <p class="flex items-center font-medium text-gray-900 truncate">
              <Icon icon="mdi:map-marker" class="w-5 h-5 text-blue-500 mr-2" />
              {{ loc.name }}
            </p>
            <p class="flex items-center text-sm text-gray-600 truncate">
              <Icon icon="mdi:map-marker-outline" class="w-4 h-4 text-gray-400 mr-1" />
              {{ loc.address }}
            </p>
            <p class="flex items-center text-xs text-gray-500">
              <Icon icon="mdi:map-marker-distance" class="w-4 h-4 mr-1" />
              {{ loc.latitude }}, {{ loc.longitude }}
            </p>
          </div>
          <Button variant="ghost" class="text-red-600 hover:text-red-800 p-2" @click="() => deleteSavedLocation(loc.id)" :disabled="loading">
            <Icon icon="mdi:trash-can-outline" class="w-5 h-5" />
          </Button>
        </div>
      </template>
      <p v-else-if="!loading" class="text-center text-gray-500 py-4">
        No tienes ubicaciones guardadas
      </p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import Card from '../../../ui/Card.vue';
import Button from '../../../ui/Button.vue';
import { usePassengerProfileStore } from '../store/passengerProfileStore';

const store = usePassengerProfileStore();
const { savedLocations, loading, error, fetchSavedLocations, addSavedLocation, deleteSavedLocation, clearError } = store;

const showForm = ref(false);
const form = reactive({ name: '', address: '', latitude: '', longitude: '' });

onMounted(fetchSavedLocations);

function toggleForm() {
  showForm.value = !showForm.value;
  if (error && error.valueOf()) clearError();
}

async function handleSubmit() {
  if (!form.name || !form.address || !form.latitude || !form.longitude) return;
  await addSavedLocation({
    name: form.name,
    address: form.address,
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
  });
  Object.assign(form, { name: '', address: '', latitude: '', longitude: '' });
  showForm.value = false;
}
</script>

<style scoped>
.input-field {
  @apply w-full pl-10 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200;
}
.btn-gradient {
  @apply w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200;
}
</style>
