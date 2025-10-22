import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { passengerDashboardApi } from '../services/passengerDashboardApi';
import type {
  PassengerDashboardStats,
  PassengerQuickAction,
} from '../types';

export const usePassengerDashboard = defineStore('passengerDashboard', () => {
  /* state -------------------------------------------------------- */
  const stats        = ref<PassengerDashboardStats | null>(null);
  const quickActions = ref<PassengerQuickAction[]>([]);
  const loading      = ref(false);
  const error        = ref<string | null>(null);

  const router = useRouter();

  /* helpers ------------------------------------------------------ */
  const buildQuickActions = (): PassengerQuickAction[] => [
    {
      id:          'request-trip',
      title:       'Request Trip',
      description: 'Book a new ride',
      icon:        'mdi:car',
      action:      () => router.push('/passenger/trip-request'),
    },
    {
      id:          'trip-history',
      title:       'Trip History',
      description: 'View your past trips',
      icon:        'mdi:clipboard-list',
      action:      () => router.push('/passenger/trip-history'),
    },
    {
      id:          'saved-locations',
      title:       'Saved Places',
      description: 'Manage your locations',
      icon:        'mdi:map-marker',
      action:      () => router.push('/passenger/profile'),
    },
  ];

  /* actions ------------------------------------------------------ */
  async function loadPassengerDashboard() {
    try {
      loading.value = true;
      error.value   = null;

      /* stats */
      stats.value = await passengerDashboardApi.getPassengerStats();

      /* quick-actions */
      quickActions.value = buildQuickActions();
    } catch (e: any) {
      error.value = e?.message ?? 'Error loading passenger dashboard';
    } finally {
      loading.value = false;
    }
  }

  async function refreshPassengerStats() {
    try {
      loading.value = true;
      stats.value   = await passengerDashboardApi.getPassengerStats();
    } catch (e: any) {
      error.value = e?.message ?? 'Error refreshing passenger stats';
    } finally {
      loading.value = false;
    }
  }

  function clearPassengerError() {
    error.value = null;
  }

  /* expose ------------------------------------------------------- */
  return {
    /* state */
    stats,
    quickActions,
    loading,
    error,
    /* actions */
    loadPassengerDashboard,
    refreshPassengerStats,
    clearPassengerError,
  };
});
