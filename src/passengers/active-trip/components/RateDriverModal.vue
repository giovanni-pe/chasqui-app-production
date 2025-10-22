<script setup lang="ts">
import { computed, ref } from 'vue';
import { useActiveTripStore } from '@/passengers/active-trip/stores/useActiveTripStore';

const store = useActiveTripStore();
const visible = computed(() => store.ratingVisible);

const rating  = ref(5);
const comment = ref('');

function submit() {
  store.sendRating({ rating: rating.value, comment: comment.value });
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4">
        <h2 class="font-bold text-lg">Califica a tu conductor</h2>

        <div class="flex gap-1">
          <span
            v-for="n in 5"
            :key="n"
            @click="rating = n"
            class="cursor-pointer text-2xl"
          >{{ n <= rating ? '⭐' : '☆' }}</span>
        </div>

        <textarea
          v-model="comment"
          rows="3"
          placeholder="Comentario (opcional)"
          class="w-full border rounded px-3 py-2 text-sm"
        />

        <button
          @click="submit"
          :disabled="store.loadingRate"
          class="bg-sky-600 hover:bg-sky-700 w-full text-white rounded py-2 font-semibold"
        >
          {{ store.loadingRate ? 'Enviando…' : 'Enviar' }}
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to       { opacity: 0 }
</style>
