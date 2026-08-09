import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/auth.store.js";
import HomeLanding from "@/features/home/views/home-landing.vue";
import LobbyWaitingRoom from "@/features/lobby/views/lobby-waiting-room.vue";
import AuthPage from "@/features/auth/views/auth-page.vue";

const routes = [
  {
    path: "/auth",
    name: "auth",
    component: AuthPage,
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    name: "home",
    component: HomeLanding,
  },
  {
    path: "/lobby",
    name: "lobby",
    component: LobbyWaitingRoom,
    meta: { requiresAuth: true },
  },
  {
    path: "/:gameId",
    name: "game",
    component: () => import("../features/game/views/game-view.vue"),
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(
  (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore();
    const requiresAuth = to.meta.requiresAuth === true;
    const requiresGuest = to.meta.requiresGuest === true;

    if (authStore.loading) {
      next();
      return;
    }

    if (requiresGuest && authStore.isAuthenticated) {
      router.push('/lobby');
      return;
    }

    if (to.path === '/' && authStore.isAuthenticated) {
      router.push('/lobby');
      return;
    }

    if (requiresAuth && !authStore.isAuthenticated) {
      router.push('/auth');
      return;
    }

    next();
  },
);
