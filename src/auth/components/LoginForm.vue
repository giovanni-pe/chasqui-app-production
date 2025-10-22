<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { useAuthStore } from '@/auth/stores/auth';

import Button from '@/ui/Button.vue';
import type { LoginCredentials } from '../types';
import GoogleSignInButton from './GoogleSignInButton.vue'
const auth = useAuthStore();

const fieldErrors = reactive<Record<string, string>>({});
const showPassword = ref(false);
const loginInputRef = ref<HTMLInputElement>();
const passwordInputRef = ref<HTMLInputElement>();

const formData = reactive({
  login: '',
  password: ''
});

// Detectar automáticamente el tipo de input
const inputType = computed(() => {
  if (!formData.login) return 'text';
  return formData.login.includes('@') ? 'email' : 'tel';
});

const placeholderText = computed(() => {
  if (!formData.login) return '999123456 o email@ejemplo.com';
  return formData.login.includes('@') ? 'tu@email.com' : '999123456';
});

function validateForm() {
  const errors: Record<string, string> = {};

  if (!formData.login.trim()) {
    errors.login = 'Ingresa tu teléfono o email';
  } else {
    const isEmail = formData.login.includes('@');
    if (isEmail && !isValidEmail(formData.login)) {
      errors.login = 'Por favor ingresa un email válido';
    } else if (!isEmail && !isValidPhone(formData.login)) {
      errors.login = 'Por favor ingresa un teléfono válido (9 dígitos)';
    }
  }

  if (!formData.password) {
    errors.password = 'Ingresa tu contraseña';
  } else if (formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  Object.assign(fieldErrors, errors);
  return Object.keys(errors).length === 0;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!validateForm()) {
    // Focus en el primer campo con error
    if (fieldErrors.login) {
      loginInputRef.value?.focus();
    } else if (fieldErrors.password) {
      passwordInputRef.value?.focus();
    }
    return;
  }
  
  try {
    await auth.login({ ...formData });
  } catch {
    // error ya manejado por el store
  }
}

function clearFieldError(key: keyof LoginCredentials) {
  if (fieldErrors[key]) fieldErrors[key] = '';
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// Auto-focus en el primer campo al montar
import { onMounted } from 'vue';

onMounted(() => {
  loginInputRef.value?.focus();
});
</script>

<template>
  <form @submit="handleSubmit" class="space-y-6" novalidate>
     <GoogleSignInButton class="mt-6" />
    <div class="space-y-2">
      <label 
        for="login" 
        class="block text-sm font-semibold text-gray-900"
      >
        Teléfono o Email
      </label>
      <div class="relative">
        <input
          id="login"
          ref="loginInputRef"
          type="text"
          inputmode="email"
          class="w-full px-4 py-4 text-base border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                 transition-all duration-200 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:shadow-lg
                 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                 hover:border-gray-400 touch-manipulation"
          :class="{
            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.login,
            'border-green-300 focus:ring-green-500 focus:border-green-500': formData.login && !fieldErrors.login
          }"
          v-model="formData.login"
          :placeholder="placeholderText"
          :disabled="auth.loading"
          autocomplete="username"
          @input="clearFieldError('login')"
          @blur="validateForm"
        />
        
        <!-- Icono de validación -->
        <div v-if="formData.login" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg v-if="!fieldErrors.login" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <Transition name="error" mode="out-in">
        <p v-if="fieldErrors.login" class="text-sm text-red-600 flex items-center gap-1">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ fieldErrors.login }}
        </p>
      </Transition>
    </div>

    <!-- Password Field -->
    <div class="space-y-2">
      <label 
        for="password" 
        class="block text-sm font-semibold text-gray-900"
      >
        Contraseña
      </label>
      <div class="relative">
        <input
          id="password"
          ref="passwordInputRef"
          :type="showPassword ? 'text' : 'password'"
          class="w-full px-4 py-4 pr-12 text-base border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 
                 transition-all duration-200 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:shadow-lg
                 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                 hover:border-gray-400 touch-manipulation"
          :class="{
            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.password,
            'border-green-300 focus:ring-green-500 focus:border-green-500': formData.password && !fieldErrors.password
          }"
          v-model="formData.password"
          placeholder="Ingresa tu contraseña"
          :disabled="auth.loading"
          autocomplete="current-password"
          @input="clearFieldError('password')"
          @blur="validateForm"
        />
        
        <!-- Botón mostrar/ocultar contraseña -->
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200 touch-manipulation"
          @click="togglePasswordVisibility"
          :disabled="auth.loading"
          tabindex="-1"
        >
          <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      
      <Transition name="error" mode="out-in">
        <p v-if="fieldErrors.password" class="text-sm text-red-600 flex items-center gap-1">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ fieldErrors.password }}
        </p>
      </Transition>
    </div>

    <!-- Error del servidor -->
    <Transition name="slide-down" mode="out-in">
      <div v-if="auth.error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-700 text-sm font-medium">{{ auth.error }}</p>
        </div>
      </div>
    </Transition>

    <!-- Enlaces adicionales - Móvil optimizado -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
      <label class="flex items-center touch-manipulation">
        <input type="checkbox" class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded">
        <span class="ml-2 text-gray-700">Recordar sesión</span>
      </label>
      <a href="#" class="text-sky-600 hover:text-sky-500 font-medium transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-sky-50 touch-manipulation text-center">
        ¿Olvidaste tu contraseña?
      </a>
    </div>

    <!-- Botón -->
    <Button 
      type="submit" 
      fullWidth 
      :loading="auth.loading" 
      :disabled="auth.loading"
      class="!py-4 !text-lg font-semibold !rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
    >
      <span v-if="!auth.loading">Iniciar Sesión</span>
      <span v-else class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Iniciando sesión...
      </span>
    </Button>
  </form>
</template>

<style scoped>
/* Transiciones para los errores */
.error-enter-active, .error-leave-active {
  transition: all 0.3s ease;
}
.error-enter-from, .error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Estados de hover y focus mejorados para móvil */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Animación del botón optimizada para móvil */
button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

button[type="submit"]:active:not(:disabled) {
  transform: translateY(0);
}

/* Optimizaciones específicas para móvil */
@media (hover: none) and (pointer: coarse) {
  /* Eliminar hover effects en dispositivos táctiles */
  input:hover {
    border-color: rgb(209 213 219); /* border-gray-300 */
  }
  
  button[type="submit"]:hover:not(:disabled) {
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

/* Mejoras para inputs en móviles */
@media screen and (max-width: 767px) {
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"] {
    font-size: 16px !important; /* Evita zoom en iOS */
  }
}
</style>