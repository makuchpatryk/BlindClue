import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.store.js";

type AuthView = "login" | "signup" | "forgot";

export function useAuthService() {
  const authStore = useAuthStore();
  const router = useRouter();
  const currentView = ref<AuthView>("login");

  async function signin(email: string, password: string): Promise<boolean> {
    const result = await authStore.signin(email, password);
    if (result.ok) {
      router.push("/lobby");
      return true;
    }
    return false;
  }

  async function signup(email: string, password: string): Promise<boolean> {
    const result = await authStore.signup(email, password);
    if (result.ok) {
      authStore.setMessage("Account created! Check your email to verify.");
      setTimeout(() => {
        currentView.value = "login";
        authStore.clearMessage();
      }, 3000);
      return true;
    }
    return false;
  }

  async function requestPasswordReset(email: string): Promise<boolean> {
    const result = await authStore.forgotPassword(email);
    return result.ok;
  }

  async function confirmPasswordReset(
    email: string,
    code: string,
    password: string,
  ): Promise<boolean> {
    const result = await authStore.confirmPasswordReset(email, code, password);
    if (result.ok) {
      authStore.setMessage("Password reset! Sign in with new password.");
      setTimeout(() => {
        currentView.value = "login";
        authStore.clearMessage();
      }, 2000);
      return true;
    }
    return false;
  }

  function switchView(view: AuthView): void {
    currentView.value = view;
    authStore.clearError();
  }

  function clearError(): void {
    authStore.clearError();
  }

  return {
    currentView,
    loading: authStore.loading,
    error: authStore.error,
    message: authStore.message,
    signin,
    signup,
    requestPasswordReset,
    confirmPasswordReset,
    switchView,
    clearError,
  };
}
