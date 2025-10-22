<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';          // Lucide o cualquier set de Iconify
import { cn } from '@/lib/utils';
import { useNavigation } from '@/router/useNavigation';

import MqttStatus   from '@/ui/MqttStatus.vue';
import ProfileMenu  from '@/ui/ProfileMenu.vue';

interface Props {
  className?: string;
  headerTitle?: string;
  footer?: unknown;
  sidebar?: unknown;
  showBack?: boolean;
  onBack?: () => void;
  mobileNav?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
});

const { goBack } = useNavigation();

/* Menú de perfil desplegable */
const menuOpen = ref(false);
function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
function closeMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 w-full max-w-md mx-auto bg-white/80 backdrop-blur-2xl
             border-b border-blue-100/50 shadow-soft px-4 pt-12 flex items-center justify-between"
    >
      <!-- Botón back + título -->
      <div class="flex items-center gap-2">
       <button
  v-if="props.showBack"
  @click="(props.onBack || goBack)()"
  class="rounded-full p-2 hover:scale-105 transition-transform duration-200"
  aria-label="Retroceder"
>
  <Icon icon="lucide:arrow-left" width="22" height="22" />
</button>


        <span
          v-if="props.headerTitle"
          class="font-semibold text-lg text-gray-900 truncate"
        >
          {{ props.headerTitle }}
        </span>
      </div>

      <!-- Mqtt status + menú -->
      <div class="flex items-center gap-3">
        <MqttStatus />

        <!-- Dropdown Perfil -->
        <div class="relative inline-block text-left group">
          <button
            @click="toggleMenu"
            class="rounded-full p-2 hover:scale-105 transition-transform duration-200"
            aria-label="Más opciones"
          >
            <Icon icon="lucide:more-vertical" width="22" height="22" />
          </button>

          <!-- Panel -->
          <div
            v-if="menuOpen"
            class="absolute top-full right-4 mt-2 z-50"
          >
            <!-- Flecha -->
            <div class="flex justify-end px-3">
              <div
                class="w-3 h-3 bg-gradient-to-r from-blue-300 to-cyan-300
                       transform rotate-45 -translate-y-1/2"
              />
            </div>

            <!-- Wrapper degradado -->
            <div
              class="bg-gradient-to-r from-blue-300 to-cyan-300 p-px rounded-2xl
                     shadow-glam animate-open"
            >
              <div
                class="bg-white/90 backdrop-blur-xl rounded-[inherit]
                       min-w-[16rem] max-w-[20rem] border border-white/30"
              >
                <ProfileMenu :closeMenu="closeMenu" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main area (sidebar opcional en desktop) -->
    <div class="flex-1 flex flex-col lg:flex-row w-full max-w-md mx-auto">
      <aside
        v-if="props.sidebar"
        class="hidden lg:block w-64 bg-white/90 backdrop-blur-xl border-r border-gray-100/50 shadow-soft"
      >
        <slot name="sidebar">
          <!-- si prefieres pasarlo como prop -->
          <component :is="props.sidebar" />
        </slot>
      </aside>

      <main :class="cn('flex-1 p-4', props.className)">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <footer
      v-if="props.footer"
      class="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-gray-100/50 p-4"
    >
      <slot name="footer">
        <component :is="props.footer" />
      </slot>
    </footer>

    <!-- Mobile bottom nav -->
    <nav
      v-if="props.mobileNav"
      class="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto
             bg-white/80 backdrop-blur-2xl border-t border-blue-100/50 shadow-mid lg:hidden"
    >
      <slot name="mobileNav">
        <component :is="props.mobileNav" />
      </slot>
    </nav>
  </div>
</template>
