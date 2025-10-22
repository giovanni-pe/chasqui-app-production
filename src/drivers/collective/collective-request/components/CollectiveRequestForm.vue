<template>
  <div class="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-5 mt-8">
    <h2 class="text-lg font-bold text-blue-700 mb-2">Crear viaje colectivo</h2>

    <!-- Origen -->
    <div>
      <label class="block font-medium text-sm mb-1">📍 Origen</label>
      <input
        class="input input-bordered w-full"
        type="text"
        placeholder="Selecciona tocando el mapa"
        :value="store.origin?.address || ''"
        @focus="store.setActiveSelection('origin')"
        readonly
      />
      <button class="btn btn-primary w-full mt-2" @click="store.setActiveSelection('origin')">
        Elegir en el mapa
      </button>
    </div>

    <!-- Destino -->
    <div>
      <label class="block font-medium text-sm mb-1">🏁 Destino</label>
      <input
        class="input input-bordered w-full"
        type="text"
        placeholder="Selecciona tocando el mapa"
        :value="store.destination?.address || ''"
        @focus="store.setActiveSelection('destination')"
        readonly
      />
      <button class="btn btn-primary w-full mt-2" @click="store.setActiveSelection('destination')">
        Elegir en el mapa
      </button>
    </div>

    <!-- Tipo de servicio -->
    <div>
      <label class="block font-medium text-sm mb-1">🚗 Tipo de servicio</label>
      <select v-model="store.serviceTypeId" class="input input-bordered w-full">
        <option value="" disabled>Selecciona...</option>
        <option value="1">Colectivo Auto</option>
        <option value="2">Colectivo Mototaxi</option>
        <!-- Actualiza IDs si corresponde -->
      </select>
    </div>

    <!-- Vehículo -->
    <div>
      <label class="block font-medium text-sm mb-1">🚘 Vehículo</label>
      <select v-model="store.vehicleId" class="input input-bordered w-full">
        <option value="" disabled>Selecciona tu vehículo...</option>
        <option v-for="v in vehicles" :key="v.id" :value="v.id">
          {{ v.plate }} - {{ v.model }} ({{ v.color }})
        </option>
      </select>
    </div>

    <!-- Capacidad máxima -->
    <div>
      <label class="block font-medium text-sm mb-1">👥 Capacidad máxima</label>
      <input
        type="number"
        min="2"
        max="20"
        v-model.number="store.maxPassengers"
        class="input input-bordered w-full"
      />
    </div>

    <!-- Tarifa estimada (opcional) -->
    <div>
      <label class="block font-medium text-sm mb-1">💰 Tarifa estimada (opcional)</label>
      <input
        type="number"
        min="0"
        step="0.5"
        v-model.number="store.estimatedFare"
        placeholder="S/ 0.00"
        class="input input-bordered w-full"
      />
    </div>

    <!-- Botón de crear -->
    <button
      class="btn btn-primary w-full mt-4"
      :disabled="store.loading || !formReady"
      @click="handleCreate"
    >
      {{ store.loading ? 'Creando...' : '🚀 Crear viaje colectivo' }}
    </button>

    <div v-if="store.error" class="text-red-600 text-xs mt-2 text-center">{{ store.error }}</div>
    <div v-if="store.status === 'created'" class="bg-green-50 text-green-700 rounded mt-4 p-2 text-center">
      ¡Viaje colectivo creado correctamente!
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useCollectiveRequestStore } from '../store/useCollectiveRequestStore';
import { api } from '@/lib/api'; // Usado para cargar vehículos

export default defineComponent({
  name: 'CollectiveRequestForm',
  setup() {
    const store = useCollectiveRequestStore();
    const vehicles = ref<{ id: number; plate: string; model: string; color: string }[]>([]);

    // Cargar vehículos del conductor al montar
    onMounted(async () => {
      // Ajusta el endpoint si tu backend lo requiere
      const { data } = await api.get('/driver/vehicles');
      vehicles.value = Array.isArray(data) ? data : [];
      // Si hay solo uno, lo selecciona automáticamente
      if (vehicles.value.length === 1) {
        store.setVehicleId(vehicles.value[0].id);
      }
    });

    // El formulario está listo sólo si TODOS los campos obligatorios están completos
    const formReady = computed(() =>
      !!store.origin &&
      !!store.destination &&
      !!store.serviceTypeId &&
      !!store.vehicleId &&
      !!store.maxPassengers
    );

    async function handleCreate() {
      await store.createCollectiveTrip();
    }

    return { store, vehicles, formReady, handleCreate };
  }
});
</script>
