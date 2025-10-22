// src/router/index.ts
import {
  createRouter,
  createWebHistory,

} from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import PublicRoute from '@/router/components/PublicRoute.vue';
import ProtectedRoute from '@/router/components/ProtectedRoute.vue';
import NotFound from '@/router/components/NotFound.vue';
import ErrorFallback from './components/ErrorFallBack.vue'; // ⇦ crea este .vue con el mismo markup del componente React
import Loading from '@/ui/Loading.vue';

import { useNavigation } from '@/router/useNavigation';

/* ─────────────────  Lazy imports de Auth  ───────────────── */
const Login = () => import('@/auth/pages/Login.vue');
const Register = () => import('@/auth/pages/Register.vue');

/* ─────────────  Redirección Dashboard genérico  ──────────── */
const DashboardRedirect = () => import('@/router/components/DashboardRedirect.vue');


const Dashboard = {
  setup() {
    const { goToDashboard } = useNavigation();
    goToDashboard();
    return {};
  },
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div>
        <div class="loader mx-auto mb-2" />
        <div class="text-center text-gray-500">Redirigiendo a tu panel...</div>
      </div>
    </div>
  `,
};

/* ──────────────────────  Rutas  ─────────────────────────── */
const routes: RouteRecordRaw[] = [
  /* ─── Públicas ─── */
  {
    path: '/',
    component: PublicRoute,
    children: [
      { path: '', name: 'Home', component: Login },
      { path: 'login', name: 'Login', component: Login },
      { path: 'register', name: 'Register', component: Register },
    ],
  },
  // src/router/index.ts
  {
    path: '/choose-role',
    name: 'ChooseRole',
    component: () => import('@/auth/pages/CompleteProfile.vue'),
    meta: { requiresAuth: true },
  },

  /* ─── Dashboard genérico ─── */
  {
    path: '/dashboard',
    component: ProtectedRoute,
    children: [{ path: '', component: Dashboard }],
  },
  {
    path: '/passenger',
    component: ProtectedRoute,
    children: [
      {
        path: 'dashboard',
        component: PassengerDashboardPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Loading passenger dashboard...' }) } },
      },
      {
        path: 'trip-request',
        component: RequestTripPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Loading passenger trip request panel...' }) } },
      },
      {
        path: 'active-trip',
        component: ActiveTripInner,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Loading active trip...' }) } },
      },
      {
        path: 'profile',
        component: PassengerProfile,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Loading active trip...' }) } },
      },
      {
        path: 'trip-history',
        component: TripHistory,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Loading active trip...' }) } },
      },
      {
        path: 'collective/request',
        component: PassengerCollectiveRequestPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
       {
        path: 'collective/active',
        component: PassengersCollectiveActivePage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
    ]
  },
  {
    path: '/driver',
    component: ProtectedRoute,
    children: [
      {
        path: 'trip-request',
        component: TripRequest,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando estado de conductor...' }) } },
      },
      {
        path: 'active-trip',
        component: DriverActiveTripPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando estado de conductor...' }) } },
      },
      {
        path: 'dashboard',
        component: DriverDashboard,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
      {
        path: 'profile',
        component: DriverProfile,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      }, {
        path: 'status',
        component: DriverStatus,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
      {
        path: 'earnings',
        component: EarningsPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
      {
        path: 'collective/request',
        component: CollectiveRequestPage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      },
      {
        path: 'collective/active',
        component: CollectiveActivePage,
        meta: { suspense: { fallback: () => h(Loading, { fullScreen: true, text: 'Cargando panel...' }) } },
      }

    ]
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

/* ──────────────  Router instantiation  ───────────── */
export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

/* Meta typing extra */
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: string[];
    permissions?: string[];
  }
}


export { useNavigation } from '@/router/useNavigation';
import RoleGuard from './components/RoleGuard.vue';
import PassengerDashboardPage from '@/passengers/dashoboard/pages/PassengerDashboardPage.vue';
import RequestTripPage from '@/passengers/trip-request/pages/RequestTripPage.vue';
import ActiveTripInner from '@/passengers/active-trip/pages/ActiveTripInner.vue';
import TripRequest from '@/drivers/trip-request/pages/TripRequests.vue';
import { h } from 'vue';
import DriverActiveTripPage from '@/drivers/active-trip/pages/DriverActiveTripPage.vue';
import DriverDashboard from '@/drivers/dashboard/pages/DriverDashboard.vue';
import DriverProfile from '@/drivers/profile/pages/DriverProfile.vue';
import DriverStatus from '@/drivers/status/pages/DriverStatus.vue';
import EarningsPage from '@/drivers/earnings/pages/EarningsPage.vue';
import PassengerProfile from '@/passengers/profile/pages/PassengerProfile.vue';
import TripHistory from '@/passengers/trip-history/pages/TripHistory.vue';
export { RoleGuard };
export { routeRegistry } from '@/router/registry';
export type { RouteConfig, ModuleRoutes } from '@/router/types';

import { useAuthStore } from '@/auth/stores/auth';
import { useTripRedirectStore } from '@/router/stores/useTripRedirectStore';
import CollectiveRequestPage from '@/drivers/collective/collective-request/pages/CollectiveRequestPage.vue';
import CollectiveActivePage from '@/drivers/collective/collective-active/pages/CollectiveActivePage.vue';
import PassengerCollectiveRequestPage from '@/passengers/collective/collective-request/pages/PassengerCollectiveRequestPage.vue';
import PassengersCollectiveActivePage from '@/passengers/collective/collective-active/pages/PassengersCollectiveActivePage.vue';

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const tripRedirect = useTripRedirectStore();

  // 1. Asegura que la sesión esté cargada
  await auth.ensureInitialized();

  // 2. Evita bucle
  if (to.path.includes('/active-trip')) return next();

  // 3. Verifica si debe redirigir a viaje activo
  await tripRedirect.initTripRedirect();

  if (tripRedirect.activeTripPath && to.path !== tripRedirect.activeTripPath) {
    return next(tripRedirect.activeTripPath);
  }

  next();
});
