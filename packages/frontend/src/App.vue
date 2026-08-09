<template>
  <div id="app" class="min-h-screen bg-gray-900 text-gray-100">
    <header class="bg-gray-800 shadow">
      <nav class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-2xl font-bold text-blue-400"
            >Impostor</router-link
          >
          <div v-if="!authLoading" class="flex items-center gap-4">
            <div v-if="isAuthenticated" class="flex items-center gap-4">
              <span class="text-sm text-gray-300">{{ user?.name || user?.email }}</span>
              <button
                @click="logout"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Logout
              </button>
            </div>
            <div v-else>
              <button
                @click="login"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      sdsss
      sadsadsad
      asdsadsad

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "@/features/auth/composables/use-auth.js";

const { user, isAuthenticated, loading: authLoading, login, logout, initialize } = useAuth();

onMounted(() => {
  initialize();
});
</script>

<style scoped>
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
}
</style>
