<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="joinGame" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Game Code</label>
        <input
          v-model="gameCode"
          type="text"
          class="w-full px-4 py-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter game code"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="!gameCode || isJoining"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isJoining ? 'Joining...' : 'Join Game' }}
      </button>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLobbyStore } from '../stores/lobby.store.js';
import { useGameStore } from '../../game/stores/game.store.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const lobbyStore = useLobbyStore();
const gameStore = useGameStore();
const gameCode = ref('');
const isJoining = ref(false);
const error = ref<string | null>(null);

function joinGame() {
  if (!lobbyStore.playerName.trim()) {
    error.value = 'Please enter your name';
    return;
  }

  isJoining.value = true;
  error.value = null;

  try {
    gameStore.reset();
    localStorage.removeItem('game_session');
    lobbyStore.setGameCode(gameCode.value);
    router.push(`/game/${gameCode.value}`);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isJoining.value = false;
  }
}
</script>
