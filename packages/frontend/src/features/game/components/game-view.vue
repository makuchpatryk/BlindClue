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
        <div v-if="isImpostor" class="bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-4">
          <p class="text-red-200 font-bold text-center text-lg">🎭 YOU ARE THE IMPOSTOR</p>
        </div>

        <div class="bg-gray-700 rounded-lg shadow p-6">
          <div class="text-center">
            <h3 class="text-sm font-semibold text-gray-400 mb-2">ROUND {{ currentRound }}/3</h3>
            <h2 class="text-3xl font-bold text-white mb-4">It's {{ currentPlayer?.name }}'s turn</h2>
            <div class="bg-gray-800 rounded p-4 mb-6 space-y-3">
              <p class="text-gray-300 text-lg">Category: <span class="text-yellow-400 font-bold">{{ isImpostor ? category : '???' }}</span></p>
              <p v-if="!isImpostor && word" class="text-gray-300 text-lg">Word to guess: <span class="text-green-400 font-bold">{{ word }}</span></p>
            </div>

            <div v-if="currentRound < 3 || playersClickedThisRound.size < players.length" class="space-y-4">
              <button
                @click="handleNextPerson"
                :disabled="!isMyTurn || (!isNextButtonBlocked && hasPlayerClicked)"
                class="w-full px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span v-if="isNextButtonBlocked && isMyTurn">I'm Ready</span>
                <span v-else-if="!isNextButtonBlocked && isMyTurn">Next Person</span>
                <span v-else>Waiting for {{ currentPlayer?.name }}...</span>
              </button>
              <p v-if="!isMyTurn" class="text-sm text-gray-400">Waiting for {{ currentPlayer?.name }} to continue...</p>
            </div>

            <div v-else class="space-y-4">
              <p class="text-lg text-gray-300 mb-4">All rounds complete! Who is the impostor?</p>
              <PlayerSelectionList />
              <button
                @click="handleShowImpostor"
                :disabled="!selectedImpostorGuess"
                class="w-full px-6 py-3 bg-green-600 text-white text-lg font-bold rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {{ selectedImpostorGuess ? 'Show Impostor' : 'Select a player first' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="status === 'VOTING'" class="space-y-4">
        <VotingPhase v-if="!votes" />
        <RevealPhase v-else />
      </div>

      <div v-else-if="status === 'ENDED'" class="space-y-4">
        <h2 class="text-2xl font-bold text-white mb-6">Game Over</h2>

        <div v-if="isImpostor && !votes" class="mb-4">
          <ImpostorGuessPhase />
        </div>

        <div v-else class="space-y-4">
          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Most Voted</h3>
            <p class="text-xl text-white">
              Players voted for: <span class="font-bold text-yellow-400">{{ getMostVotedName() }}</span>
              <span class="text-gray-400 ml-2">({{ getMostVotedCount() }} votes)</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">The Impostor Was</h3>
            <p class="text-xl text-white">
              <span class="font-bold text-red-400">{{ getImpostorName() }}</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Category Revealed</h3>
            <p class="text-xl text-white">
              <span class="font-bold text-blue-400">{{ category }}</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-4">Final Scores</h3>
            <div class="space-y-2">
              <div v-for="(score, index) in finalScores" :key="score.playerId" class="flex justify-between items-center">
                <span class="text-white">{{ index + 1 }}. {{ score.playerName }}</span>
                <span class="font-bold text-yellow-400">{{ score.score }} pts</span>
              </div>
            </div>
          </div>

          <button
            @click="$router.push('/')"
            class="w-full mt-4 px-4 py-3 bg-green-600 text-white text-lg font-bold rounded hover:bg-green-700 transition"
          >
            Play Again
          </button>
        </div>
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
import ImpostorGuessPhase from './impostor-guess-phase.vue';
import PlayerSelectionList from './player-selection-list.vue';

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
const currentPlayer = computed(() => gameStore.currentPlayer);
const canShowShowImpostorButton = computed(() => gameStore.canShowShowImpostorButton);
const playersClickedThisRound = computed(() => gameStore.playersClickedThisRound);
const hasPlayerClicked = computed(() => {
  return currentPlayer.value ? gameStore.hasPlayerClickedThisRound(currentPlayer.value.id) : false;
});
const isMyTurn = computed(() => currentPlayer.value?.id === myPlayerId.value);
const isNextButtonBlocked = computed(() => gameStore.isNextButtonBlocked);
const selectedImpostorGuess = computed(() => gameStore.selectedImpostorGuess);

function startGame() {
  const socket = getSocket();
  socket.emit('startGame', { gameId });
}

function handleNextPerson() {
  if (isNextButtonBlocked.value) {
    gameStore.unblockNextButton();
    gameClientService.unblockButton(gameId);
  } else if (currentPlayer.value) {
    gameStore.advancePlayerTurn(currentPlayer.value.id);
    gameClientService.advanceTurn(
      gameId,
      currentPlayer.value.id,
      gameStore.currentPlayerIndex,
      Array.from(gameStore.playersClickedThisRound),
      gameStore.isNextButtonBlocked
    );
  }
}

function handleShowImpostor() {
  gameStore.setStatus('VOTING');
}

function getMostVotedName() {
  if (!gameStore.mostVoted) return 'Unknown';
  const player = players.value.find(p => p.id === gameStore.mostVoted);
  return player?.name || 'Unknown';
}

function getMostVotedCount() {
  if (!gameStore.mostVoted || !gameStore.votes) return 0;
  return gameStore.votes.get(gameStore.mostVoted) || 0;
}

function getImpostorName() {
  if (!gameStore.impostorId) return 'Unknown';
  const player = players.value.find(p => p.id === gameStore.impostorId);
  return player?.name || 'Unknown';
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
