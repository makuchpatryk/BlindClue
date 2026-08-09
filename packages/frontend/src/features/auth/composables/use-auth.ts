import { computed } from "vue";
import { useAuthStore } from "../stores/auth.store.js";

export function useAuth() {
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const loading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);
  const message = computed(() => authStore.message);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    message,
    login: () => authStore.login(),
    logout: () => authStore.logout(),
    refresh: () => authStore.refresh(),
    signin: (email: string, password: string) => authStore.signin(email, password),
    signup: (email: string, password: string) => authStore.signup(email, password),
    forgotPassword: (email: string) => authStore.forgotPassword(email),
    confirmPasswordReset: (email: string, code: string, password: string) =>
      authStore.confirmPasswordReset(email, code, password),
    initialize: () => authStore.initializeAuth(),
  };
}
