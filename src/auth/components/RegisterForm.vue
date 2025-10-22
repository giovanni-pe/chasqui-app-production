<template>
  <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
    <GoogleSignInButton class="mt-6" />
    <div class="grid grid-cols-2 gap-4">
      <Input v-model="auth.formData.first_name" :error="auth.fieldErrors.first_name" label="Nombre"
        placeholder="Tu nombre" :disabled="auth.loading" />
      <Input v-model="auth.formData.last_name" :error="auth.fieldErrors.last_name" label="Apellido"
        placeholder="Tu apellido" :disabled="auth.loading" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <Input v-model="auth.formData.phone" :error="auth.fieldErrors.phone" label="Teléfono" type="tel"
        placeholder="999123456" :disabled="auth.loading" />
      <Input v-model="auth.formData.email" :error="auth.fieldErrors.email" label="Email " type="email"
        placeholder="email@ejemplo.com" :disabled="auth.loading" />
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-medium">Tipo de usuario</label>
      <div class="grid grid-cols-2 gap-4">
        <label class="flex items-center">
          <input type="radio" value="passenger" v-model="auth.formData.user_type" :disabled="auth.loading" />
          <span class="ml-2">Pasajero</span>
        </label>
        <label class="flex items-center">
          <input type="radio" value="driver" v-model="auth.formData.user_type" :disabled="auth.loading" />
          <span class="ml-2">Conductor</span>
        </label>
      </div>
      <p v-if="auth.fieldErrors.user_type" class="text-sm text-red-600">
        {{ auth.fieldErrors.user_type }}
      </p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <Input v-model="auth.formData.password" :error="auth.fieldErrors.password" label="Contraseña"
        :type="showPassword ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" :disabled="auth.loading" />
      <Input v-model="auth.confirmPassword" :error="auth.fieldErrors.confirmPassword" label="Confirmar Contraseña"
        :type="showPassword ? 'text' : 'password'" placeholder="Repite tu contraseña" :disabled="auth.loading" />
    </div>

    <button type="button" @click="togglePasswordVisibility" class="text-sm text-sky-600">
      {{ showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
    </button>
    <div v-if="auth.error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {{ auth.error }}
    </div>
    <Button type="submit" fullWidth :loading="auth.loading"
      :disabled="auth.loading || Object.keys(auth.fieldErrors).length > 0" class="block w-full py-3 font-semibold">
      {{ auth.loading ? 'Registrando...' : 'Crear Cuenta' }}
    </Button>
  </form>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  import Input from '@/ui/Input.vue'
  import Button from '@/ui/Button.vue'

  import { useAuthStore } from '../stores/auth'
  import { useRegisterFormValidation } from '../validation/useRegisterFormValidation'
  import GoogleSignInButton from './GoogleSignInButton.vue'

  const auth = useAuthStore()
  const showPassword = ref(false)

  useRegisterFormValidation()
  const togglePasswordVisibility = () => showPassword.value = !showPassword.value
  const handleSubmit = async (e: Event) => (
    e.preventDefault(), auth.clearError(), 
    Object.keys(auth.fieldErrors).length === 0 && await auth.register().catch(() => { }))
</script>
