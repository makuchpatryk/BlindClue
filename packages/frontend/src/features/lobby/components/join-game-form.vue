<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Join Game</h2>
    <form @submit.prevent="joinGame" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Game Code</label>
        <input
          v-model="gameCode"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter game code"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="!gameCode || isJoining"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isJoining ? 'Joining...' : 'Join Game' }}
      </button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLobbyStore } from '../stores/lobby.store.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const lobbyStore = useLobbyStore();
const gameCode = ref('');
const isJoining = ref(false);
const error = ref<string | null>(null);

function joinGame() {
  isJoining.value = true;
  error.value = null;

  try {
    lobbyStore.setGameCode(gameCode.value);
    router.push(`/game/${gameCode.value}`);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isJoining.value = false;
  }
}
</script>
