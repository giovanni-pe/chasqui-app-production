import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePassengerDashboard as usePassengerDashboardStore } from '../stores/index';

export function usePassengerDashboard() {
  const store = usePassengerDashboardStore();
  const {
    stats,
    quickActions,
    loading,
    error,
  } = storeToRefs(store);

  /* carga inicial (equiv. useEffect) */
  onMounted(() => {
    store.loadPassengerDashboard();
  });

  return {
    /* state (readonly refs) */
    passengerStats:        stats,
    passengerQuickActions: quickActions,
    passengerLoading:      loading,
    passengerError:        error,
    /* actions */
    refreshPassengerStats: store.refreshPassengerStats,
    clearPassengerError:   store.clearPassengerError,
    reloadPassengerDashboard: store.loadPassengerDashboard,
  };
}
