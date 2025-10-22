<template>
  <div class="max-w-xl mx-auto px-4 py-6 bg-white/80 backdrop-blur-xl border border-white/30 shadow-soft rounded-3xl">
    <h2 class="text-xl font-bold text-yellow-800 mb-4">
      {{ store.profile ? '🛠️ Editar Perfil' : '👋 Bienvenido, registra tu perfil de conductor' }}
    </h2>

    <form @submit.prevent="step === 2 ? handleSubmit() : nextStep()" class="space-y-5">
      <!-- STEP 1: DATOS DEL CONDUCTOR -->
      <div v-if="step === 1">
        <div>
          <label class="block text-sm font-medium text-slate-700">Número de licencia</label>
          <input v-model="form.license_number" type="text" placeholder="ABC-123456"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.license_number ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.license_number" class="text-sm text-red-500 mt-1">{{ errors.license_number }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Fecha de vencimiento</label>
          <input v-model="form.license_expiry_date" type="date"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.license_expiry_date ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.license_expiry_date" class="text-sm text-red-500 mt-1">{{ errors.license_expiry_date }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Nombre contacto de emergencia</label>
          <input v-model="form.emergency_contact_name" type="text" placeholder="Juan Pérez"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.emergency_contact_name ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.emergency_contact_name" class="text-sm text-red-500 mt-1">{{ errors.emergency_contact_name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Teléfono contacto de emergencia</label>
          <input v-model="form.emergency_contact_phone" type="tel" placeholder="999-999-999"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.emergency_contact_phone ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.emergency_contact_phone" class="text-sm text-red-500 mt-1">{{ errors.emergency_contact_phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Radio de búsqueda (km)</label>
          <input v-model="form.search_radius_km" type="number" min="1" placeholder="5"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.search_radius_km ? 'border-red-400 bg-red-50' : '']" />
          <p class="text-xs text-gray-500 mt-1">Rango en kilómetros desde tu ubicación actual.</p>
          <p v-if="errors.search_radius_km" class="text-sm text-red-500 mt-1">{{ errors.search_radius_km }}</p>
        </div>
      </div>

      <!-- STEP 2: DATOS DEL VEHÍCULO -->
      <div v-if="step === 2">
        <div>
          <label class="block text-sm font-medium text-slate-700">Tipo de vehículo</label>
          <select v-model="form.vehicle_type"
                  :class="['input input-bordered w-full shadow-inner mt-1', errors.vehicle_type ? 'border-red-400 bg-red-50' : '']">
            <option value="">Selecciona tipo</option>
            <option value="motorcycle">Motocicleta</option>
            <option value="car">Carro</option>
            <option value="collective">Colectivo</option>
            <option value="mototaxi">Mototaxi</option>
          </select>
          <p v-if="errors.vehicle_type" class="text-sm text-red-500 mt-1">{{ errors.vehicle_type }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Placa del vehículo</label>
          <input v-model="form.license_plate" type="text" placeholder="ABC-123"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.license_plate ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.license_plate" class="text-sm text-red-500 mt-1">{{ errors.license_plate }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Marca</label>
          <input v-model="form.brand" type="text" placeholder="GENÉRICO"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.brand ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.brand" class="text-sm text-red-500 mt-1">{{ errors.brand }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Modelo</label>
          <input v-model="form.model" type="text" placeholder="ModeloX"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.model ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.model" class="text-sm text-red-500 mt-1">{{ errors.model }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Color</label>
          <input v-model="form.color" type="text" placeholder="Amarillo"
                 :class="['input input-bordered w-full shadow-inner mt-1', errors.color ? 'border-red-400 bg-red-50' : '']" />
          <p v-if="errors.color" class="text-sm text-red-500 mt-1">{{ errors.color }}</p>
        </div>
      </div>

      <!-- NAVIGATION BUTTONS -->
      <div class="flex justify-between">
        <button v-if="step === 2" type="button" @click="prevStep"
                class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ← Volver
        </button>
        <button type="submit"
                class="ml-auto px-4 py-2 bg-yellow-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 hover:bg-yellow-700 disabled:opacity-60"
                :disabled="store.loading">
          {{ step === 1 ? 'Siguiente →' : store.loading ? 'Guardando...' : (store.profile ? 'Guardar cambios' : 'Registrar conductor') }}
        </button>
      </div>

      <div v-if="store.error" class="text-red-500 text-sm mt-2">{{ store.error }}</div>
      <div v-if="store.registrationSuccess" class="text-green-600 font-medium text-sm mt-2">{{ store.registrationSuccess }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted ,ref} from 'vue'
import { useDriverProfileStore } from '../store/driverProfileStore'
import type { DriverProfileUpdate, DriverRegistrationPayload } from '../types'

const store = useDriverProfileStore()
const step = ref(1)

const form = reactive({
  license_number: '',
  license_expiry_date: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  search_radius_km: '',
  vehicle_type: '',
  license_plate: '',
  brand: '',
  model: '',
  color: ''
})

const errors = reactive<Record<string, string>>({})

onMounted(() => {
  store.fetchProfile()
})

watch(
  () => store.profile,
  (p) => {
    if (p) {
      form.license_number = p.license_number || ''
      form.license_expiry_date = p.license_expiry_date || ''
      form.emergency_contact_name = p.emergency_contact_name || ''
      form.emergency_contact_phone = p.emergency_contact_phone || ''
      form.search_radius_km = p.search_radius_km?.toString() || ''
        form.vehicle_type   = p.vehicle?.vehicle_type   ?? '';
    form.license_plate  = p.vehicle?.license_plate  ?? '';
    form.brand          = p.vehicle?.brand          ?? '';
    form.model          = p.vehicle?.model          ?? '';
    form.color          = p.vehicle?.color          ?? '';
    }
  },
  { immediate: true }
)

function validateStep1() {
  let valid = true
  errors.license_number = !form.license_number ? 'Este campo es obligatorio.' : ''
  errors.license_expiry_date = !form.license_expiry_date ? 'Fecha requerida.' : ''
  errors.emergency_contact_name = !form.emergency_contact_name ? 'Ingresa un nombre.' : ''
  errors.emergency_contact_phone = !form.emergency_contact_phone ? 'Número requerido.' : ''
  errors.search_radius_km = !form.search_radius_km ? 'Debes especificar el radio.' : ''
  for (const k of ['license_number','license_expiry_date','emergency_contact_name','emergency_contact_phone','search_radius_km']) {
    if (errors[k]) valid = false
  }
  return valid
}

function validateStep2() {
  let valid = true
  errors.vehicle_type = !form.vehicle_type ? 'Selecciona un tipo de vehículo.' : ''
  errors.license_plate = !form.license_plate ? 'Ingresa la placa.' : ''
  errors.brand = !form.brand ? 'Ingresa la marca.' : ''
  errors.model = !form.model ? 'Ingresa el modelo.' : ''
  errors.color = !form.color ? 'Ingresa el color.' : ''
  for (const k of ['vehicle_type','license_plate','brand','model','color']) {
    if (errors[k]) valid = false
  }
  return valid
}

function nextStep() {
  if (validateStep1()) step.value = 2
}

function prevStep() {
  step.value = 1
}

async function handleSubmit() {
  store.clearError()
  if (!validateStep2()) return

  if (store.profile) {
    const payload: DriverProfileUpdate = {
      license_expiry_date: form.license_expiry_date.slice(0, 10),
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      search_radius_km: form.search_radius_km ? Number(form.search_radius_km) : undefined
    }
    await store.updateProfile(payload)
  } else {
    const payload: DriverRegistrationPayload = {
      license_number: form.license_number,
      license_expiry_date: form.license_expiry_date.slice(0, 10),
      vehicle_type: form.vehicle_type as 'motorcycle' | 'car' | 'collective' | 'mototaxi',
      license_plate: form.license_plate,
      brand: form.brand,
      model: form.model,
      color: form.color
    }
    await store.registerDriver(payload)
    await store.fetchProfile()
  }
}
</script>
