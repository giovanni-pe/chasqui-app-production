<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import Card from '@/ui/Card.vue';
import LoginForm from '@/auth/components/LoginForm.vue';
import { useAuth } from '@/auth/composables/useAuth';


const router = useRouter();
const {
  loading,
  error,
  isAuthenticated,
} = useAuth();

const isRedirecting = ref(false);
const showContent = ref(false);

/* Redirige inmediatamente si ya hay sesión */
watch(
  () => isAuthenticated.value,
  logged => {
    if (logged) {
      isRedirecting.value = true;
      router.replace('/dashboard');
    }
  },
  { immediate: true },
);

// Animación de entrada
onMounted(() => {
  setTimeout(() => {
    showContent.value = true;
  }, 100);
});
</script>

<template>
  <!-- Container principal optimizado para móvil -->
  <div class="min-h-screen bg-gradient-to-b from-sky-500 via-sky-600 to-cyan-700 flex flex-col">
    <!-- Loader para redirección -->
    <Transition name="fade" mode="out-in">
      <div v-if="isRedirecting" class="flex-1 flex items-center justify-center px-4">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <svg class="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </div>
          <p class="text-white font-medium text-lg">Ingresando...</p>
        </div>
      </div>

      <!-- Contenido principal -->
      <div v-else class="flex-1 flex flex-col">
        <Transition name="slide-up" appear>
          <div v-if="showContent" class="flex-1 flex flex-col">

            <!-- Header con branding - Optimizado para móvil -->
            <div class="flex-shrink-0 pt-12 pb-8 px-6 text-center">
              <!-- Logo -->
              <div
                class="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>

              <!-- Título y subtítulo -->
              <h1 class="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
                Chasqui Taxi
              </h1>
              <p class="text-sky-100 text-lg sm:text-xl font-medium">
                Tu viaje seguro te espera
              </p>
            </div>

            <!-- Card del formulario - Diseño móvil first -->
            <div class="flex-1 bg-white rounded-t-3xl shadow-2xl px-6 py-8 min-h-0 overflow-y-auto">
              <div class="max-w-sm mx-auto space-y-8">

            

                <!-- Título del formulario -->
                <div class="text-center">
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    Iniciar Sesión
                  </h2>
                </div>
                
                <!-- Formulario -->
                <LoginForm />

                <!-- Divider -->
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200"></div>
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-4 bg-white text-gray-500">¿No tienes cuenta?</span>
                  </div>
                </div>

                <!-- Botón de registro - Móvil optimizado -->
                <RouterLink to="/register"
                  class="flex items-center justify-center w-full px-6 py-4 border-2 border-sky-500 text-sky-600 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 rounded-xl font-semibold text-lg transition-all duration-200 group touch-manipulation">
                  <span>Crear cuenta nueva</span>
                  <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </RouterLink>

                <!-- Links de ayuda -->
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 pt-4">
                  <a href="#"
                    class="hover:text-gray-700 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50 touch-manipulation">
                    Centro de ayuda
                  </a>
                  <span class="hidden sm:inline">•</span>
                  <a href="#"
                    class="hover:text-gray-700 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-gray-50 touch-manipulation">
                    Contactar soporte
                  </a>
                </div>
              </div>
            </div>

            <!-- Footer minimalista para móvil -->
            <div class="flex-shrink-0 bg-white px-6 py-4 text-center">
              <p class="text-xs text-gray-400">
                © 2024 Chasqui Taxi
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

/* Optimizaciones móviles específicas */
@supports (padding: max(0px)) {
  .pt-12 {
    padding-top: max(3rem, env(safe-area-inset-top) + 1rem);
  }
}

/* Mejoras de touch */
@media (hover: none) and (pointer: coarse) {

  /* Estilos específicos para dispositivos táctiles */
  .hover\:bg-sky-100:hover {
    background-color: rgb(240 249 255);
  }

  .hover\:bg-gray-50:hover {
    background-color: rgb(249 250 251);
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-height: 667px) {
  .pt-12 {
    padding-top: 2rem;
  }

  .pb-8 {
    padding-bottom: 1.5rem;
  }

  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

/* Ajustes para landscape en móviles */
@media (max-height: 500px) and (orientation: landscape) {
  .min-h-screen {
    min-height: 100vh;
  }

  .pt-12 {
    padding-top: 1rem;
  }

  .pb-8 {
    padding-bottom: 1rem;
  }

  .w-24 {
    width: 4rem;
    height: 4rem;
  }

  .text-4xl {
    font-size: 1.875rem;
  }
}

/* Evitar zoom en inputs en iOS */
@media screen and (max-width: 767px) {

  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"] {
    font-size: 16px !important;
  }
}

/* Mejoras para accesibilidad en móviles */
@media (prefers-reduced-motion: reduce) {

  .slide-up-enter-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .group-hover\:translate-x-1:hover {
    transform: none;
  }
}
</style>