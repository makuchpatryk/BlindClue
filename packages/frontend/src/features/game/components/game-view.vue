<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">{{ gameStatus }}</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <div v-if="status === 'LOBBY'" class="space-y-4">
        <h2 class="text-2xl font-bold">Waiting for players...</h2>
        <p class="text-gray-600">Game Code: <code class="font-mono font-bold">{{ gameId }}</code></p>
        <div class="mt-4">
          <h3 class="font-semibold mb-2">Players:</h3>
          <ul class="space-y-2">
            <li v-for="player in players" :key="player.id" class="text-gray-700">
              {{ player.name }}
            </li>
          </ul>
        </div>
        <button
          v-if="canStartGame"
          @click="startGame"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start Game
        </button>
      </div>

      <div v-else-if="status === 'RUNNING'" class="space-y-4">
        <h2 class="text-2xl font-bold">Round {{ currentRound }}/3</h2>
        <p class="text-lg">Category: <strong>{{ category }}</strong></p>
        <p v-if="!isImpostor" class="text-lg text-blue-600">You know the word</p>
        <p v-else class="text-lg text-red-600">You are the Impostor</p>
      </div>

      <div v-else-if="status === 'VOTING'" class="space-y-4">
        <h2 class="text-2xl font-bold">Voting Phase</h2>
        <p class="text-gray-600">Who is the impostor?</p>
      </div>

      <div v-else-if="status === 'ENDED'" class="space-y-4">
        <h2 class="text-2xl font-bold">Game Over</h2>
        <div class="mt-4">
          <h3 class="font-semibold mb-2">Final Scores:</h3>
          <ul class="space-y-2">
            <li v-for="score in finalScores" :key="score.playerId" class="flex justify-between">
              <span>{{ score.playerName }}</span>
              <span class="font-bold">{{ score.score }}</span>
            </li>
          </ul>
        </div>
        <button
          @click="$router.push('/')"
          class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '../stores/game.store.js';
import { getSocket } from '../../shared/utils/socket.js';

const route = useRoute();
const gameStore = useGameStore();
const gameId = route.params.gameId as string;

const status = computed(() => gameStore.status);
const currentRound = computed(() => gameStore.currentRound);
const category = computed(() => gameStore.category);
const isImpostor = computed(() => gameStore.isImpostor);
const players = computed(() => gameStore.players);
const finalScores = computed(() => gameStore.finalScores);
const canStartGame = computed(() => players.value.length >= 2);

const gameStatus = computed(() => {
  const statusMap = {
    LOBBY: 'Lobby',
    RUNNING: 'In Progress',
    VOTING: 'Voting',
    ENDED: 'Game Over',
  };
  return statusMap[status.value];
});

function startGame() {
  const socket = getSocket();
  socket.emit('startGame', { gameId });
}
</script>
