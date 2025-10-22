<template>
  <div v-once>
    <div id="g_id_onload"
         :data-client_id="clientId"
         data-context="signin"
         data-ux_mode="popup"
         data-callback="handleGoogleCredentialResponse">
    </div>
    <div class="g_id_signin"
         data-type="standard"
         data-size="large"
         data-theme="outline"
         data-text="sign_in_with"
         data-shape="rectangular"
         data-logo_alignment="left">
    </div>
  </div>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/auth/stores/auth'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!   // ← agrega a tu .env.

/**
 * Google Identity Services inyecta handleGoogleCredentialResponse en global.
 * Declaramos la función en window para que pueda verla.
 */
const auth = useAuthStore()
onMounted(() => {
  // @ts-ignore
  window.handleGoogleCredentialResponse = async ({ credential }) => {
    await auth.googleSignIn(credential)
  }
  // Carga el script GIS si aún no está
  if (!document.getElementById('google-sdk')) {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.id = 'google-sdk'
    document.head.appendChild(s)
  }
})
</script>
