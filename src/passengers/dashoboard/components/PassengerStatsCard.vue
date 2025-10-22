<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import Card from '@/ui/Card.vue';

interface Props {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
});

const colorMap = computed(() => {
  return {
    blue: {
      bg:   'bg-gradient-to-br from-blue-200/80 to-cyan-200/80',
      text: 'text-blue-700',
      ring: 'ring-blue-200/40',
    },
    green: {
      bg:   'bg-gradient-to-br from-emerald-200/80 to-teal-200/80',
      text: 'text-green-700',
      ring: 'ring-emerald-200/40',
    },
    purple: {
      bg:   'bg-gradient-to-br from-violet-200/80 to-purple-200/80',
      text: 'text-purple-700',
      ring: 'ring-violet-200/40',
    },
    orange: {
      bg:   'bg-gradient-to-br from-amber-200/80 to-orange-200/80',
      text: 'text-orange-700',
      ring: 'ring-amber-200/40',
    },
  }[props.color!];
});
</script>

<template>
  <Card class="relative overflow-hidden p-6 hover:shadow-glam transition-shadow duration-300">
    <!-- Fondos decorativos flotantes -->
    <div class="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-white/20 blur-2xl animate-float" />
    <div class="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-3xl" />

    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-1">{{ value }}</p>
      </div>

      <div
        v-if="icon"
        :class="[
          'relative flex items-center justify-center w-14 h-14 rounded-3xl shadow-soft ring-2 animate-float transition-transform duration-300 hover:scale-105',
          colorMap.bg,
          colorMap.text,
          colorMap.ring
        ]"
      >
        <Icon :icon="icon" class="w-7 h-7" />
        <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-white/10 pointer-events-none" />
      </div>
    </div>
  </Card>
</template>
