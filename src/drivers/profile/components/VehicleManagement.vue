<template>
  <div class="my-6 max-w-2xl mx-auto px-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-yellow-800">🚗 Tus vehículos</h3>
      <button
        class="bg-white text-yellow-700 border border-yellow-300 font-medium px-3 py-1 rounded-lg hover:bg-yellow-100 transition"
        @click="toggleShowAdd"
      >
        {{ showAdd ? 'Cancelar' : 'Agregar vehículo' }}
      </button>
    </div>

    <!-- Formulario agregar -->
    <form
      v-if="showAdd"
      class="space-y-3 p-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-soft"
      @submit.prevent="handleAdd"
    >
      <div v-for="field in requiredFields" :key="field.key">
        <input
          v-model="newVehicle[field.key]"
          :placeholder="field.placeholder"
          :class="[
            'input input-bordered w-full shadow-inner',
            fieldErrors[field.key] ? 'border-red-400 bg-red-50' : ''
          ]"
        />
        <p v-if="fieldErrors[field.key]" class="text-sm text-red-500 mt-1">
          {{ fieldErrors[field.key] }}
        </p>
      </div>

      <input
        v-model.number="newVehicle.year"
        type="number"
        class="input input-bordered w-full shadow-inner"
        placeholder="Año"
      />
      <input
        v-model.number="newVehicle.passenger_capacity"
        type="number"
        class="input input-bordered w-full shadow-inner"
        placeholder="Capacidad"
      />

      <button
        class="bg-yellow-600 text-white font-semibold rounded-xl px-4 py-2 shadow-md hover:scale-105 transition-transform duration-200 hover:bg-yellow-700 disabled:opacity-60 w-full"
        type="submit"
        :disabled="store.loading"
      >
        {{ store.loading ? 'Guardando...' : 'Agregar vehículo' }}
      </button>
    </form>

    <!-- Lista de vehículos -->
    <div class="divide-y mt-6 rounded-2xl overflow-hidden shadow-sm bg-white/60 backdrop-blur border border-white/20">
      <div
        v-for="v in store.vehicles"
        :key="v.id"
        class="py-4 px-4 hover:bg-slate-50/50 transition-colors duration-150"
      >
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1">
            <div class="text-base font-semibold text-slate-700">
              {{ v.vehicle_type }} {{ v.brand }} {{ v.model }}
            </div>
            <div class="text-sm text-gray-600">
              Placa: {{ v.license_plate }} • Año: {{ v.year }}
              <span class="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': v.vehicle_status === 'active',
                  'bg-yellow-100 text-yellow-800': v.vehicle_status === 'maintenance',
                  'bg-red-100 text-red-700': v.vehicle_status === 'inactive'
                }"
              >
                {{ v.vehicle_status }}
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <button
              class="text-yellow-700 border border-yellow-400 text-xs px-3 py-1 rounded-lg hover:bg-yellow-50 transition"
              @click="toggleEdit(v.id)"
            >
              {{ editing[v.id] ? 'Cancelar' : 'Editar' }}
            </button>

            <!-- Formulario editar -->
            <form
              v-if="editing[v.id]"
              class="flex flex-col gap-2 mt-2 w-64 bg-white/90 p-3 rounded-xl shadow-inner border border-white/20"
              @submit.prevent="() => handleUpdate(v.id, editValues[v.id])"
            >
              <input
                v-model="editValues[v.id].color"
                class="input input-xs input-bordered shadow-inner"
                placeholder="Color"
              />
              <select
                v-model="editValues[v.id].vehicle_status"
                class="input input-xs input-bordered"
              >
                <option value="active">Activo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="inactive">Inactivo</option>
              </select>
              <button
                class="bg-yellow-600 text-white text-xs px-3 py-1 rounded-lg hover:scale-105 transition"
                type="submit"
                :disabled="store.loading"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.error" class="text-red-500 text-sm mt-4">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Vehicle } from '../types'
import { useDriverProfileStore } from '../store/driverProfileStore'

const store = useDriverProfileStore()

const showAdd = ref(false)
const fieldErrors = reactive<Record<string, string>>({})
type VehicleFieldKey = 'vehicle_type' | 'brand' | 'model' | 'license_plate' | 'color';
const requiredFields: { key: VehicleFieldKey; placeholder: string }[] = [
  { key: 'vehicle_type', placeholder: 'Tipo (motorcycle, car...)' },
  { key: 'brand', placeholder: 'Marca' },
  { key: 'model', placeholder: 'Modelo' },
  { key: 'license_plate', placeholder: 'Placa' },
  { key: 'color', placeholder: 'Color' }
];



const defaultNewVehicle = (): Partial<Vehicle> => ({
  vehicle_type: '',
  brand: '',
  model: '',
  license_plate: '',
  color: '',
  year: new Date().getFullYear(),
  passenger_capacity: 2
})

const newVehicle = reactive(defaultNewVehicle())

const editing = reactive<Record<string, boolean>>({})
const editValues = reactive<Record<string, Partial<Vehicle>>>({})

onMounted(store.fetchVehicles)

function toggleShowAdd() {
  showAdd.value = !showAdd.value
  if (showAdd.value) {
    store.clearError()
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  }
}

function resetNewVehicleForm() {
  Object.assign(newVehicle, defaultNewVehicle())
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
}

function validateFields(): boolean {
  let valid = true
  fieldErrors.vehicle_type = !newVehicle.vehicle_type ? 'Requerido' : ''
  fieldErrors.brand = !newVehicle.brand ? 'Requerido' : ''
  fieldErrors.model = !newVehicle.model ? 'Requerido' : ''
  fieldErrors.license_plate = !newVehicle.license_plate ? 'Requerido' : ''
  fieldErrors.color = !newVehicle.color ? 'Requerido' : ''

  for (const key in fieldErrors) {
    if (fieldErrors[key]) valid = false
  }

  return valid
}

async function handleAdd() {
  store.clearError()
  if (!validateFields()) return

  await store.addVehicle(newVehicle)
  resetNewVehicleForm()
  showAdd.value = false
}

function toggleEdit(id: string) {
  editing[id] = !editing[id]
  if (editing[id]) {
    const v = store.vehicles.find((v) => v.id === id)
    if (v) {
      editValues[id] = {
        color: v.color,
        vehicle_status: v.vehicle_status
      }
      store.clearError()
    }
  }
}

async function handleUpdate(id: string, changes: Partial<Vehicle>) {
  store.clearError()
  await store.updateVehicle(id, changes)
  editing[id] = false
}
</script>
