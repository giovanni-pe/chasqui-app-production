<template>
  <!-- Fondo con gradiente peruano y efectos glassmorphism -->
  <section class="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-40 right-20 w-24 h-24 bg-yellow-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-red-600 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
    
    <!-- Contenedor principal con mejor glassmorphism -->
    <div class="relative z-10 min-h-screen flex items-start justify-center p-4 pt-8">
      <div class="w-full max-w-md bg-white/85 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
      <!-- Encabezado compacto -->
<div
  class="relative flex items-center gap-3
         bg-gradient-to-r from-red-500 via-red-600 to-red-700
         px-4 py-3 rounded-b-3xl shadow-lg overflow-hidden"
>
  <!-- Capa glass • sutil -->
  <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

  <!-- Icono dentro de círculo traslúcido -->
  <div
    class="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center
           rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-sm"
  >
    <Icon icon="mdi:car-multiple" class="h-6 w-6 text-white" />
  </div>

  <!-- Títulos -->
  <div class="relative z-10 flex-1">
    <h1 class="text-lg font-bold text-white leading-tight">{{ heading }}</h1>
    <p class="text-xs text-white/90">{{ subheading }}</p>
  </div>
</div>


        <!-- Indicador de progreso -->
        <div class="px-6 py-4 bg-white/50">
          <div class="flex items-center justify-center space-x-2">
            <div v-for="i in 3" :key="i" 
                 class="w-3 h-3 rounded-full transition-all duration-500"
                 :class="i <= step + 1 ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110' : 'bg-gray-300'">
            </div>
          </div>
          <div class="mt-2 text-center text-sm text-gray-600 font-medium">
            {{ progressText }}
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="p-6 space-y-6">
          <!-- ───── Paso 0: Selección de tipo de usuario ───── -->
          <div v-if="step === 0" class="space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-xl font-semibold text-gray-800">¿Cómo quieres usar Chasquie?</h2>
              <p class="text-sm text-gray-600">Elige la opción que mejor se adapte a ti</p>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <!-- Opción Pasajero -->
              <button @click="pickRole('passenger')"
                      class="group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      :class="pickedRole === 'passenger' ? 
                        'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg' : 
                        'border-gray-200 bg-white hover:border-red-300'">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon icon="mdi:account-heart" class="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="font-bold text-lg text-gray-800">Pasajero</h3>
                    <p class="text-sm text-gray-600 mt-1">Viaja cómodo y ahorra dinero</p>
                    <div class="flex items-center mt-2 space-x-2">
                      <Icon icon="mdi:cash-multiple" class="w-4 h-4 text-green-500" />
                      <span class="text-xs text-green-600 font-medium">Ahorra hasta 40%</span>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" class="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
              </button>

              <!-- Opción Conductor -->
              <button @click="pickRole('driver')"
                      class="group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      :class="pickedRole === 'driver' ? 
                        'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg' : 
                        'border-gray-200 bg-white hover:border-red-300'">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon icon="mdi:steering" class="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="font-bold text-lg text-gray-800">Conductor</h3>
                    <p class="text-sm text-gray-600 mt-1">Genera ingresos extra conduciendo</p>
                    <div class="flex items-center mt-2 space-x-2">
                      <Icon icon="mdi:currency-usd" class="w-4 h-4 text-green-500" />
                      <span class="text-xs text-green-600 font-medium">Gana más dinero</span>
                    </div>
                  </div>
                  <Icon icon="mdi:chevron-right" class="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
              </button>
            </div>

            <!-- Beneficios destacados -->
            <div class="bg-gradient-to-r from-red-50 to-yellow-50 rounded-2xl p-4 border border-red-100">
              <div class="flex items-center space-x-2 mb-3">
                <Icon icon="mdi:shield-check" class="w-5 h-5 text-red-500" />
                <span class="font-semibold text-red-700">Chasquie te protege</span>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex items-center space-x-2">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-500" />
                  <span class="text-gray-600">100% Seguro</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-500" />
                  <span class="text-gray-600">Tarifas justas</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-500" />
                  <span class="text-gray-600">Soporte 24/7</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-500" />
                  <span class="text-gray-600">Hecho en Perú</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ───── Paso 1: Datos de licencia ───── -->
          <form v-if="step === 1" @submit.prevent="nextFromLicense" class="space-y-6">
            <div class="text-center space-y-2">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-3">
                <Icon icon="mdi:card-account-details" class="w-8 h-8 text-white" />
              </div>
              <h2 class="text-xl font-semibold text-gray-800">Datos de tu licencia</h2>
              <p class="text-sm text-gray-600">Necesitamos verificar tu licencia de conducir</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Número de licencia</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Icon icon="mdi:card-account-details-outline" class="w-5 h-5 text-gray-400" />
                  </div>
                  <input v-model="driver.license_number" 
                         type="text" 
                         class="input pl-10"
                         placeholder="Ej: Q12345678"
                         :class="errors.license_number ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                </div>
                <p v-if="errors.license_number" class="text-sm text-red-600 flex items-center">
                  <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                  {{ errors.license_number }}
                </p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Fecha de vencimiento</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Icon icon="mdi:calendar" class="w-5 h-5 text-gray-400" />
                  </div>
                  <input v-model="driver.license_expiry_date" 
                         type="date" 
                         class="input pl-10"
                         :min="new Date().toISOString().split('T')[0]"
                         :class="errors.license_expiry_date ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                </div>
                <p v-if="errors.license_expiry_date" class="text-sm text-red-600 flex items-center">
                  <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                  {{ errors.license_expiry_date }}
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <button type="submit" 
                      class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <span class="flex items-center justify-center">
                  <Icon icon="mdi:chevron-right" class="w-5 h-5 mr-2" />
                  Continuar
                </span>
              </button>
              <button type="button" 
                      @click="backToRole"
                      class="w-full text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Icon icon="mdi:chevron-left" class="w-4 h-4 mr-1" />
                Volver atrás
              </button>
            </div>
          </form>

          <!-- ───── Paso 2: Datos del vehículo ───── -->
          <form v-if="step === 2" @submit.prevent="submitAll" class="space-y-6">
            <div class="text-center space-y-2">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-3">
                <Icon icon="mdi:car-info" class="w-8 h-8 text-white" />
              </div>
              <h2 class="text-xl font-semibold text-gray-800">Datos de tu vehículo</h2>
              <p class="text-sm text-gray-600">Cuéntanos sobre tu vehículo para completar tu perfil</p>
            </div>

            <div class="space-y-4">
              <!-- Tipo de vehículo -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Tipo de vehículo</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Icon icon="mdi:car-multiple" class="w-5 h-5 text-gray-400" />
                  </div>
                  <select v-model="vehicle.vehicle_type" 
                          class="input pl-10 appearance-none"
                          :class="errors.vehicle_type ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'">
                    <option disabled value="">Selecciona tu vehículo</option>
                    <option value="motorcycle">🏍️ Motocicleta</option>
                    <option value="mototaxi">🛺 Mototaxi</option>
                    <option value="car">🚗 Automóvil</option>
                    <option value="collective">🚐 Colectivo</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Icon icon="mdi:chevron-down" class="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p v-if="errors.vehicle_type" class="text-sm text-red-600 flex items-center">
                  <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                  {{ errors.vehicle_type }}
                </p>
              </div>

              <!-- Placa y Marca -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Placa</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Icon icon="mdi:card-text" class="w-5 h-5 text-gray-400" />
                    </div>
                    <input v-model="vehicle.license_plate" 
                           type="text" 
                           class="input pl-10"
                           placeholder="ABC-123"
                           :class="errors.license_plate ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                  </div>
                  <p v-if="errors.license_plate" class="text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                    {{ errors.license_plate }}
                  </p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Marca</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Icon icon="mdi:car-cog" class="w-5 h-5 text-gray-400" />
                    </div>
                    <input v-model="vehicle.brand" 
                           type="text" 
                           class="input pl-10"
                           placeholder="Toyota"
                           :class="errors.brand ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                  </div>
                  <p v-if="errors.brand" class="text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                    {{ errors.brand }}
                  </p>
                </div>
              </div>

              <!-- Modelo y Color -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Modelo</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Icon icon="mdi:car-info" class="w-5 h-5 text-gray-400" />
                    </div>
                    <input v-model="vehicle.model" 
                           type="text" 
                           class="input pl-10"
                           placeholder="Corolla"
                           :class="errors.model ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                  </div>
                  <p v-if="errors.model" class="text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                    {{ errors.model }}
                  </p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Color</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Icon icon="mdi:palette" class="w-5 h-5 text-gray-400" />
                    </div>
                    <input v-model="vehicle.color" 
                           type="text" 
                           class="input pl-10"
                           placeholder="Blanco"
                           :class="errors.color ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-red-500 focus:ring-red-500'" />
                  </div>
                  <p v-if="errors.color" class="text-sm text-red-600 flex items-center">
                    <Icon icon="mdi:alert-circle" class="w-4 h-4 mr-1" />
                    {{ errors.color }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <button type="submit" 
                      :disabled="loading"
                      class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <span v-if="loading" class="flex items-center justify-center">
                  <Icon icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
                  Completando perfil...
                </span>
                <span v-else class="flex items-center justify-center">
                  <Icon icon="mdi:check-circle" class="w-5 h-5 mr-2" />
                  Completar perfil
                </span>
              </button>
              <button type="button" 
                      @click="step = 1"
                      class="w-full text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Icon icon="mdi:chevron-left" class="w-4 h-4 mr-1" />
                Volver atrás
              </button>
            </div>
          </form>

          <!-- Error general -->
          <div v-if="generalError" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-center">
              <Icon icon="mdi:alert-circle" class="w-5 h-5 text-red-500 mr-2" />
              <p class="text-sm text-red-700">{{ generalError }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/auth/stores/auth'
import { useNavigation } from '@/router/useNavigation'

/* ───── stores ───── */
const auth = useAuthStore()
const { goToDashboard } = useNavigation()

/* ───── Tipos y estado ───── */
type Role = 'passenger' | 'driver'
const step = ref<0 | 1 | 2>(0)
const pickedRole = ref<Role | null>(null)

const driver = reactive({
  license_number: '',
  license_expiry_date: '', // Fecha como string única
})

const vehicle = reactive({
  vehicle_type: '',
  license_plate: '',
  brand: '',
  model: '',
  color: '',
})

const loading = ref(false)
const generalError = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})

/* ───── Textos dinámicos mejorados ───── */
const heading = computed(() => {
  switch (step.value) {
    case 0: return 'Bienvenido a Chasquie'
    case 1: return 'Verifica tu licencia'
    case 2: return 'Registra tu vehículo'
    default: return 'Bienvenido a Chasquie'
  }
})

const subheading = computed(() => {
  switch (step.value) {
    case 0: return 'La app peruana que te conecta y te hace ahorrar'
    case 1: return 'Seguridad y confianza para todos'
    case 2: return 'Último paso para empezar a ganar'
    default: return 'La app peruana que te conecta y te hace ahorrar'
  }
})

const progressText = computed(() => {
  switch (step.value) {
    case 0: return 'Paso 1 de 3: Elige tu rol'
    case 1: return 'Paso 2 de 3: Verifica tu licencia'
    case 2: return 'Paso 3 de 3: Registra tu vehículo'
    default: return 'Paso 1 de 3: Elige tu rol'
  }
})

/* ───── Funciones auxiliares ───── */

/* ───── Validaciones mejoradas ───── */
function validateLicense() {
  const newErrors: Record<string, string> = {}
  
  if (!driver.license_number.trim()) {
    newErrors.license_number = 'El número de licencia es obligatorio'
  } else if (driver.license_number.length < 8) {
    newErrors.license_number = 'El número de licencia debe tener al menos 8 caracteres'
  }
  
  if (!driver.license_expiry_date) {
    newErrors.license_expiry_date = 'Selecciona la fecha de vencimiento'
  } else {
    const selectedDate = new Date(driver.license_expiry_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate <= today) {
      newErrors.license_expiry_date = 'La licencia debe tener una fecha de vencimiento futura'
    }
  }
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

function validateVehicle() {
  const newErrors: Record<string, string> = {}
  
  if (!vehicle.vehicle_type) newErrors.vehicle_type = 'Selecciona el tipo de vehículo'
  if (!vehicle.license_plate.trim()) newErrors.license_plate = 'La placa es obligatoria'
  if (!vehicle.brand.trim()) newErrors.brand = 'La marca es obligatoria'
  if (!vehicle.model.trim()) newErrors.model = 'El modelo es obligatorio'
  if (!vehicle.color.trim()) newErrors.color = 'El color es obligatorio'
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

/* ───── Navegación con animaciones ───── */
function pickRole(role: Role) {
  pickedRole.value = role
  
  // Limpiar errores previos
  Object.keys(errors).forEach(key => errors[key] = '')
  generalError.value = null
  
  if (role === 'passenger') {
    submitAll() // Pasajero va directo al envío
  } else {
    setTimeout(() => {
      step.value = 1 // Conductor necesita completar más pasos
    }, 300)
  }
}

function backToRole() {
  step.value = 0
  pickedRole.value = null
  Object.keys(errors).forEach(key => errors[key] = '')
  generalError.value = null
  
  // Limpiar datos de licencia
  driver.license_number = ''
  driver.license_expiry_date = ''
}

function nextFromLicense() {
  if (validateLicense()) {
    setTimeout(() => {
      step.value = 2
    }, 200)
  }
}

/* ───── Envío final con mejor UX ───── */
async function submitAll() {
  if (pickedRole.value === 'driver' && !validateVehicle()) return

  loading.value = true
  generalError.value = null
  try {
    const payload: Record<string, any> = { user_type: pickedRole.value }
    if (pickedRole.value === 'driver') Object.assign(payload, driver, vehicle)

    await auth.completeProfile(payload as any)
    goToDashboard()
  } catch (e: any) {
    if (e.errors) Object.assign(errors, e.errors)
    else generalError.value = e.message || 'Error inesperado'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-3 text-sm border rounded-xl bg-white/80 backdrop-blur-sm
         placeholder-gray-400 transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-opacity-50;
}

/* Animaciones personalizadas */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Mejoras en las transiciones */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
}

/* Efectos glassmorphism mejorados */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
}

/* Mejoras específicas para móviles */
@media (max-height: 700px) {
  .min-h-screen {
    min-height: 100vh;
  }
  
  /* Reducir padding en pantallas pequeñas */
  .p-6 {
    padding: 1rem;
  }
  
  /* Asegurar que el formulario esté siempre visible */
  .relative.z-10 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

/* Prevenir zoom en inputs en iOS */
input[type="text"],
input[type="date"],
select {
  font-size: 16px !important;
}

@media (max-width: 480px) {
  input[type="text"],
  input[type="date"],
  select {
    font-size: 16px !important;
  }
}
</style>