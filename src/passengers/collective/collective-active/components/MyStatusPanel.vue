<template>
  <div v-if="myStatus" class="mb-4 flex flex-col items-center">
    <div class="text-base font-semibold mb-2">
      <span v-if="myStatus === 'reserved'">Reservado: Esperando abordar</span>
      <span v-else-if="myStatus === 'aboard'">¡A bordo! Buen viaje 🚗</span>
      <span v-else-if="myStatus === 'dropped'">Viaje finalizado, ¡gracias!</span>
      <span v-else-if="myStatus === 'cancelled'">Reserva cancelada</span>
    </div>
    <div class="flex gap-2 mt-2">
      <button
        v-if="myStatus === 'reserved'"
        class="btn btn-primary"
        @click="store.markAboard"
        :disabled="store.actionLoading"
      >
        <span v-if="store.actionLoading">Procesando...</span>
        <span v-else>Ya abordé</span>
      </button>
      <button
        v-if="myStatus === 'aboard'"
        class="btn btn-success"
        @click="store.markDropped"
        :disabled="store.actionLoading"
      >
        <span v-if="store.actionLoading">Procesando...</span>
        <span v-else>Ya bajé</span>
      </button>
      <button
        v-if="myStatus === 'reserved' || myStatus === 'aboard'"
        class="btn btn-danger"
        @click="store.cancelReservation"
        :disabled="store.actionLoading"
      >
        <span v-if="store.actionLoading">Procesando...</span>
        <span v-else>Cancelar reserva</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useCollectiveActiveStore } from '../store/useCollectiveActiveStore';

const store = useCollectiveActiveStore();
const myStatus = computed(() => store.myStatus);
</script>
