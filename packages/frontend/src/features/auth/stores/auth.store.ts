import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient } from "@/core/http-client.js";

export interface User {
  id: string;
  email: string;
  name: string;
}

type ApiResult<T> = { ok: true; value: T } | { ok: false; error: string };

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  async function initializeAuth(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await httpClient.get<{ user: User }>("/api/auth/me");
      user.value = response.user;
    } catch (err) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  function login(): void {
    window.location.href = "/auth";
  }

  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await httpClient.post("/api/auth/logout");
      user.value = null;
      window.location.href = "/";
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Logout failed";
    } finally {
      loading.value = false;
    }
  }

  async function refresh(): Promise<void> {
    try {
      await httpClient.post("/api/auth/refresh");
      await initializeAuth();
    } catch (err) {
      user.value = null;
    }
  }

  async function signin(
    email: string,
    password: string,
  ): Promise<ApiResult<User>> {
    loading.value = true;
    error.value = null;
    try {
      const response = await httpClient.post<{ ok: boolean; user: User }>(
        "/api/auth/signin",
        { email, password },
      );
      if (response.ok) {
        user.value = response.user;
        return { ok: true, value: response.user };
      }
      error.value = "Sign in failed";
      return { ok: false, error: "Sign in failed" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      error.value = msg;
      return { ok: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  async function signup(
    email: string,
    password: string,
  ): Promise<ApiResult<void>> {
    loading.value = true;
    error.value = null;
    try {
      await httpClient.post("/api/auth/signup", { email, password });
      return { ok: true, value: undefined };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      error.value = msg;
      return { ok: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(email: string): Promise<ApiResult<void>> {
    loading.value = true;
    error.value = null;
    try {
      await httpClient.post("/api/auth/forgot-password", { email });
      return { ok: true, value: undefined };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      error.value = msg;
      return { ok: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  async function confirmPasswordReset(
    email: string,
    code: string,
    password: string,
  ): Promise<ApiResult<void>> {
    loading.value = true;
    error.value = null;
    try {
      await httpClient.post("/api/auth/confirm-reset", {
        email,
        code,
        password,
      });
      return { ok: true, value: undefined };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      error.value = msg;
      return { ok: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  function setError(msg: string): void {
    error.value = msg;
  }

  function clearError(): void {
    error.value = null;
  }

  function setMessage(msg: string): void {
    message.value = msg;
  }

  function clearMessage(): void {
    message.value = null;
  }

  return {
    user,
    loading,
    error,
    message,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    refresh,
    signin,
    signup,
    forgotPassword,
    confirmPasswordReset,
    setError,
    clearError,
    setMessage,
    clearMessage,
  };
});