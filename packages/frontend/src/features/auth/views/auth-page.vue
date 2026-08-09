<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Impostor</h1>
          <p class="text-gray-400">
            <template v-if="authService.currentView.value === 'login'">
              Sign in to your account
            </template>
            <template v-else-if="authService.currentView.value === 'signup'">
              Create a new account
            </template>
            <template v-else-if="authService.currentView.value === 'forgot'">
              Reset your password
            </template>
          </p>
        </div>

        <!-- Success message -->
        <Alert
          v-if="authService.message"
          variant="success"
          class="mb-4"
        >
          {{ authService.message }}
        </Alert>

        <!-- Login Form -->
        <LoginForm
          v-if="authService.currentView.value === 'login'"
          :loading="authService.loading"
          :error="authService.error"
          @submit="handleLogin"
          @switch-to-signup="authService.switchView('signup')"
          @switch-to-forgot-password="authService.switchView('forgot')"
        />

        <!-- Signup Form -->
        <SignupForm
          v-else-if="authService.currentView.value === 'signup'"
          :loading="authService.loading"
          :error="authService.error"
          @submit="handleSignup"
          @switch-to-login="authService.switchView('login')"
        />

        <!-- Forgot Password Form -->
        <ForgotPasswordForm
          v-else-if="authService.currentView.value === 'forgot'"
          :loading="authService.loading"
          :error="authService.error"
          @request-reset="handleForgotPassword"
          @confirm-reset="handleConfirmReset"
          @switch-to-login="authService.switchView('login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthService } from "../composables/use-auth-service.js";
import { useAuthStore } from "../stores/auth.store.js";
import Alert from "@/shared/components/alert.vue";
import LoginForm from "../components/login-form.vue";
import SignupForm from "../components/signup-form.vue";
import ForgotPasswordForm from "../components/forgot-password-form.vue";

const router = useRouter();
const authStore = useAuthStore();
const authService = useAuthService();

onMounted(async () => {
  await authStore.initializeAuth();
  if (authStore.isAuthenticated) {
    router.push("/lobby");
  }
});

const handleLogin = async ({ email, password }: { email: string; password: string }) => {
  authService.clearError();
  await authService.signin(email, password);
};

const handleSignup = async ({ email, password }: { email: string; password: string }) => {
  authService.clearError();
  await authService.signup(email, password);
};

const handleForgotPassword = async ({ email }: { email: string }) => {
  authService.clearError();
  await authService.requestPasswordReset(email);
};

const handleConfirmReset = async ({
  email,
  code,
  password,
}: {
  email: string;
  code: string;
  password: string;
}) => {
  authService.clearError();
  await authService.confirmPasswordReset(email, code, password);
};
</script>
