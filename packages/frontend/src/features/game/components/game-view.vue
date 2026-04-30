<template>
  <div class="max-w-4xl mx-auto">
    <!-- Approval Waiting Modal -->
    <div v-if="joinStatus === 'pending'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-4 text-white">Waiting for approval...</h2>
        <p class="text-gray-400">The host is reviewing your request to join.</p>
      </div>
    </div>

    <!-- Host Approval Modal -->
    <div v-if="pendingJoinRequests.length > 0" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-4 text-white">Join Request</h2>
        <p class="text-lg mb-6 text-gray-300">{{ pendingJoinRequests[0].playerName }} wants to join</p>
        <div class="flex gap-3">
          <button
            @click="approveJoin(pendingJoinRequests[0].requestId)"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Allow
          </button>
          <button
            @click="rejectJoin(pendingJoinRequests[0].requestId)"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Deny
          </button>
        </div>
      </div>
    </div>

    <div class="bg-gray-800 rounded-lg shadow p-6 text-gray-100">
      <div v-if="status === 'LOBBY'" class="space-y-4">
        <h2 class="text-2xl font-bold text-white">Waiting for players...</h2>
        <p class="text-gray-400">Game Code: <code class="font-mono font-bold text-blue-400">{{ gameId }}</code></p>
        <div class="mt-4">
          <h3 class="font-semibold mb-2 text-gray-300">Players:</h3>
          <ul class="space-y-2">
            <li v-for="player in players" :key="player.id" class="text-gray-400">
              [{{ player.id.slice(0, 4).toUpperCase() }}] {{ player.name }}
            </li>
          </ul>
        </div>
        <button
          v-if="canStartGame"
          @click="startGame"
          class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Game
        </button>
      </div>

      <div v-else-if="status === 'RUNNING'" class="space-y-4">
        <h2 class="text-2xl font-bold text-white">Round {{ currentRound }}/3</h2>
        <p class="text-lg text-gray-300">Category: <strong>{{ category }}</strong></p>
        <div v-if="isImpostor" class="text-lg text-red-400">
          <p class="font-bold">You are the Impostor</p>
        </div>
        <div v-else class="text-lg text-blue-400">
          <p>Word: <span class="font-bold">{{ word }}</span></p>
        </div>
      </div>

      <div v-else-if="status === 'VOTING'" class="space-y-4">
        <VotingPhase v-if="!votes" />
        <RevealPhase v-else />
      </div>

      <div v-else-if="status === 'ENDED'" class="space-y-4">
        <h2 class="text-2xl font-bold text-white">Game Over</h2>
        <div class="mt-4">
          <h3 class="font-semibold mb-2 text-gray-300">Final Scores:</h3>
          <ul class="space-y-2">
            <li v-for="score in finalScores" :key="score.playerId" class="flex justify-between text-gray-400">
              <span>{{ score.playerName }}</span>
              <span class="font-bold text-gray-300">{{ score.score }}</span>
            </li>
          </ul>
        </div>
        <button
          @click="$router.push('/')"
          class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '../stores/game.store.js';
import { useLobbyStore } from '../../lobby/stores/lobby.store.js';
import { getSocket } from '../../shared/utils/socket.js';
import { GameClientService } from '../../shared/services/game-client.service.js';
import VotingPhase from './voting-phase.vue';
import RevealPhase from './reveal-phase.vue';

const route = useRoute();
const gameStore = useGameStore();
const lobbyStore = useLobbyStore();
const gameId = route.params.gameId as string;

const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket);
provide('gameClientService', gameClientService);

const status = computed(() => gameStore.status);
const currentRound = computed(() => gameStore.currentRound);
const category = computed(() => gameStore.category);
const word = computed(() => gameStore.word);
const isImpostor = computed(() => gameStore.isImpostor);
const players = computed(() => gameStore.players);
const finalScores = computed(() => gameStore.finalScores);
const myPlayerId = computed(() => gameStore.myPlayerId);
const joinStatus = computed(() => gameStore.joinStatus);
const pendingJoinRequests = computed(() => gameStore.pendingJoinRequests);
const canStartGame = computed(() => players.value.length >= 2);
const votes = computed(() => gameStore.votes);

function startGame() {
  const socket = getSocket();
  socket.emit('startGame', { gameId });
}

function approveJoin(requestId: string) {
  const socket = getSocket();
  const gameClientService = GameClientService.getInstance(socket);
  gameClientService.approveJoin(requestId, gameId);
  gameStore.removeJoinRequest(requestId);
}

function rejectJoin(requestId: string) {
  const socket = getSocket();
  const gameClientService = GameClientService.getInstance(socket);
  gameClientService.rejectJoin(requestId);
  gameStore.removeJoinRequest(requestId);
}

onMounted(async () => {
  gameStore.gameId = gameId;

  const sessionStr = localStorage.getItem('game_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.gameId === gameId) {
        gameStore.setJoinStatus('pending');
        gameClientService.rejoinGame(gameId, session.playerId);
        return;
      }
    } catch (e) {
      localStorage.removeItem('game_session');
    }
  }

  const playerName = lobbyStore.playerName;
  if (playerName.trim()) {
    gameStore.setJoinStatus('pending');
    gameClientService.requestJoin(gameId, playerName);
  }
});
</script>
