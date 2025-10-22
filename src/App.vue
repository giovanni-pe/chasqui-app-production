<!-- src/App.vue -->
<script setup lang="ts">
// ─── Importaciones ─────────────────────────────────────────
import { RouterView } from 'vue-router';
import { useAuthStore } from './auth/stores/auth';
import { ref, onMounted } from 'vue';

// ─── Tipados PWA / Periodic Sync ───────────────────────────
// Define los tipos que TS no trae por defecto
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type PwaRegistration = ServiceWorkerRegistration & {
  periodicSync?: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>;
  };
};

// ─── Estado / refs ─────────────────────────────────────────
const auth = useAuthStore();
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);

// ─── Ciclo de vida ─────────────────────────────────────────
onMounted(async () => {
  // 1️⃣ Inicializa auth
  auth.initialise();

  // 2️⃣ Captura el prompt de instalación PWA
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
  });

  // 3️⃣ Detecta si ya estamos en modo standalone (app instalada)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.value = true;
  }

  // 4️⃣ Registra el Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const rawReg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registrado con scope:', rawReg.scope);

      // 5️⃣ Si estamos instalados y hay periodicSync, pídelo
      const reg = rawReg as PwaRegistration;
      if (isInstalled.value && reg.periodicSync) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync'
        } as any);
        console.log('Permiso PeriodicSync:', status.state);

        if (status.state === 'granted') {
          // Cada 6h → 4 veces al día
          await reg.periodicSync.register('chasqui-sync', {
            minInterval: 1000 * 60 * 60 * 6
          });
          console.log('Periodic Sync registrado');
        } else {
          console.warn('Periodic Sync no concedido:', status.state);
        }
      }
    } catch (err) {
      console.error('Error registrando SW o PeriodicSync:', err);
    }
  }
});

// ─── Función para lanzar el diálogo de instalación ─────────
async function installPWA() {
  if (!deferredPrompt.value) return;
  await deferredPrompt.value.prompt();
  const choice = await deferredPrompt.value.userChoice;
  if (choice.outcome === 'accepted') {
    console.log('PWA instalada con éxito');
    isInstalled.value = true;
  } else {
    console.warn('Instalación PWA rechazada');
  }
  deferredPrompt.value = null;
}
</script>

<template>
  <!-- Botón de instalación que solo aparece cuando haya prompt y no esté instalada -->
  <button
    v-if="deferredPrompt && !isInstalled"
    @click="installPWA"
    class="fixed bottom-4 right-4 bg-sky-600 text-white px-4 py-2 rounded shadow-lg"
  >
    Instalar Chasqui
  </button>

  <!-- Tu aplicación Vue -->
  <RouterView />
</template>

<style>
.fixed { position: fixed; }
.bottom-4 { bottom: 1rem; }
.right-4 { right: 1rem; }
</style>
