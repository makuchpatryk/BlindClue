<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <main class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Welcome to Impostor</h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto">
          A fun party game where you try to identify who among you is the impostor.
          Discuss, debate, and vote to find out!
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">How It Works</h2>
          <p class="text-gray-400">
            One player is secretly the impostor. Everyone else knows the real rule.
            The impostor must guess the rule while others try to identify them.
          </p>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Play Online</h2>
          <p class="text-gray-400">
            Create or join a game room with your friends. Play multiple rounds,
            vote on who the impostor is, and rack up points.
          </p>
        </div>

        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4">Compete</h2>
          <p class="text-gray-400">
            Track your stats, compete with friends, and climb the leaderboards
            to become the ultimate impostor hunter.
          </p>
        </div>
      </div>

      <div class="text-center">
        <button
          v-if="!isAuthenticated && !authLoading"
          @click="login"
          class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-lg font-semibold"
        >
          Get Started - Login Now
        </button>
        <div v-else-if="authLoading" class="text-gray-400">
          Loading...
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "@/features/auth/composables/use-auth.js";

const { isAuthenticated, loading: authLoading, login } = useAuth();
</script>

<style scoped>
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Helvetica Neue", sans-serif;
}
</style>
