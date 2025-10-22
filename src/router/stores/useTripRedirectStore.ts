// src/router/stores/useTripRedirectStore.ts
import { defineStore } from 'pinia';
import { activeTripApi } from '@/passengers/active-trip/services/activeTripApi';
import { driverTripApi } from '@/drivers/active-trip/services/driverTripApi';
import { useAuthStore } from '@/auth/stores/auth';

export const useTripRedirectStore = defineStore('tripRedirect', {
    state: () => ({
        activeTripPath: null as string | null,
    }),

    actions: {
      async initTripRedirect() {
  const auth = useAuthStore();

  // Esperar inicialización de sesión
  await auth.ensureInitialized();

  if (!auth.user) {
    this.activeTripPath = null;
    return;
  }

  const userType = auth.user.user_type;

  if (userType === 'passenger' || userType === 'both') {
    const trip = await activeTripApi.getActive();
    if (trip) {
      this.activeTripPath = '/passenger/active-trip';
      return;
    }
  }

  if (userType === 'driver' || userType === 'both') {
    const trip = await driverTripApi.getActive();
    if (trip) {
      this.activeTripPath = '/driver/active-trip';
      return;
    }
  }

  this.activeTripPath = null;
}


    },
});
