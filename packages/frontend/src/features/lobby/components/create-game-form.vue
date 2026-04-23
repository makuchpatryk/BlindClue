<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Create Game</h2>
    <form @submit.prevent="createGame" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          v-model="playerName"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="!playerName || isCreating"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isCreating ? 'Creating...' : 'Create Game' }}
      </button>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLobbyStore } from '../stores/lobby.store.js';
import { getSocket } from '../../shared/utils/socket.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const lobbyStore = useLobbyStore();
const playerName = ref('');
const isCreating = ref(false);
const error = ref<string | null>(null);

async function createGame() {
  isCreating.value = true;
  error.value = null;

  try {
    const response = await fetch('http://localhost:3000/games', {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Failed to create game');

    const data = await response.json();
    const gameId = data.gameId;

    lobbyStore.setPlayerName(playerName.value);
    lobbyStore.setGameCode(gameId);

    const socket = getSocket();
    socket.emit('joinGame', { gameId, playerName: playerName.value });

    await router.push(`/game/${gameId}`);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isCreating.value = false;
  }
}
</script>
