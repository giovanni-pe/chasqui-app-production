<template>
  <div class="relative w-full h-screen bg-gray-100 overflow-hidden">
    <CollectiveRequestForm />
    <CollectiveMapView />
  </div>
</template>

<script setup lang="ts">
import CollectiveRequestForm from '../components/CollectiveRequestForm.vue';
import CollectiveMapView from '../components/CollectiveMapView.vue';
</script>
