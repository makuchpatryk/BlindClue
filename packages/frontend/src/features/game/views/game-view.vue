<template>
  <div class="max-w-4xl mx-auto">
    <!-- Copy Snackbar -->
    <div
      v-if="showCopiedSnackbar"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-40"
    >
      ✓ Game ID copied to clipboard
    </div>

    <!-- Approval Waiting Modal -->
    <div
      v-if="joinStatus === 'pending'"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-4 text-white">
          Waiting for approval...
        </h2>
        <p class="text-gray-400">The host is reviewing your request to join.</p>
      </div>
    </div>

    <!-- Host Approval Modal -->
    <div
      v-if="pendingJoinRequests.length > 0"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-4 text-white">Join Request</h2>
        <p class="text-lg mb-6 text-gray-300">
          {{ pendingJoinRequests[0].playerName }} wants to join
        </p>
        <div class="flex gap-3">
          <Button
            variant="success"
            class="flex-1"
            @click="approveJoin(pendingJoinRequests[0].requestId)"
          >
            Allow
          </Button>
          <Button
            variant="danger"
            class="flex-1"
            @click="rejectJoin(pendingJoinRequests[0].requestId)"
          >
            Deny
          </Button>
        </div>
      </div>
    </div>

    <div class="bg-gray-800 rounded-lg shadow p-6 text-gray-100">
      <div v-if="status === GameStatus.LOBBY" class="space-y-4">
        <h2 class="text-2xl font-bold text-white">Waiting for players...</h2>
        <div class="flex items-center gap-2">
          <p class="text-gray-400">
            Game Code:
            <code class="font-mono font-bold text-blue-400">{{ gameId }}</code>
          </p>
          <Button
            :no-defaults="true"
            @click="copyGameIdToClipboard"
            class="p-1 text-gray-400 hover:text-blue-400 transition"
            title="Copy game ID"
          >
            📋
          </Button>
        </div>
        <div class="mt-4">
          <h3 class="font-semibold mb-2 text-gray-300">Players:</h3>
          <ul class="space-y-2">
            <li v-for="p in players" :key="p.id" class="text-gray-400">
              [{{ p.id.slice(0, 4).toUpperCase() }}] {{ p.name }}
            </li>
          </ul>
        </div>
        <Button
          v-if="canStartGame"
          variant="success"
          full-width
          @click="startGame"
        >
          Start Game
        </Button>
      </div>

      <div v-else-if="status === GameStatus.RUNNING" class="space-y-4">
        <div
          v-if="isImpostor"
          class="bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-4"
        >
          <p class="text-red-200 font-bold text-center text-lg">
            🎭 YOU ARE THE IMPOSTOR
          </p>
        </div>

        <div class="bg-gray-700 rounded-lg shadow p-6">
          <div class="text-center">
            <h3 class="text-sm font-semibold text-gray-400 mb-2">
              ROUND {{ currentRound }}/{{ MAX_ROUNDS }}
            </h3>
            <h2 class="text-3xl font-bold text-white mb-4">
              It's {{ currentPlayer?.name }}'s turn
            </h2>
            <div class="bg-gray-800 rounded p-4 mb-6 space-y-3">
              <p class="text-gray-300 text-lg">
                Category:
                <span class="text-yellow-400 font-bold">{{
                  isImpostor ? category : "???"
                }}</span>
              </p>
              <p v-if="!isImpostor && word" class="text-gray-300 text-lg">
                Word to guess:
                <span class="text-green-400 font-bold">{{ word }}</span>
              </p>
            </div>

            <div
              v-if="
                currentRound < MAX_ROUNDS ||
                playersClickedThisRound.size < players.length
              "
              class="space-y-4"
            >
              <div v-if="isMyTurn" class="bg-gray-600 rounded-lg p-4">
                <label class="block text-gray-300 mb-2">Write a word:</label>
                <input
                  v-model="playerWordInput"
                  type="text"
                  placeholder="Enter your word..."
                  autofocus
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <Button
                full-width
                @click="handleNextPerson"
                :disabled="!isMyTurn || !playerWordInput.trim()"
              >
                <span v-if="isMyTurn">Next Person</span>
                <span v-else>Waiting for {{ currentPlayer?.name }}...</span>
              </Button>
            </div>

            <div v-else class="space-y-4">
              <p class="text-lg text-gray-300 mb-4">
                All rounds complete! Who is the impostor?
              </p>
              <PlayerSelectionList />
              <Button
                variant="success"
                full-width
                @click="handleShowImpostor"
                :disabled="!selectedImpostorGuess"
              >
                {{
                  selectedImpostorGuess
                    ? "Show Impostor"
                    : "Select a player first"
                }}
              </Button>
            </div>

            <div
              v-if="playerWords.size > 0"
              class="bg-gray-600 rounded-lg p-4 mt-6"
            >
              <h3 class="text-gray-300 font-semibold mb-3">Words Submitted:</h3>
              <div class="space-y-2">
                <div v-for="p in players" :key="p.id">
                  <span v-if="hasPlayerWord(p.id)" class="text-gray-200">
                    <span class="font-semibold">{{ p.name }}:</span>
                    <span class="text-gray-300 ml-2">{{
                      playerWords.get(p.id)?.join(", ")
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="status === GameStatus.VOTING" class="space-y-4">
        <VotingPhase v-if="!votes" />
        <RevealPhase v-else />
      </div>

      <div v-else-if="status === GameStatus.ENDED" class="space-y-4">
        <h2 class="text-2xl font-bold text-white mb-6">Game Over</h2>

        <div v-if="!gameStore.impostorDoneGuessing" class="mb-4">
          <div v-if="isImpostor">
            <ImpostorGuessPhase />
          </div>
          <div v-else class="bg-gray-700 rounded-lg shadow p-6">
            <h3 class="text-xl font-bold mb-4 text-white">
              Waiting for Impostor
            </h3>
            <p class="text-gray-400">
              The impostor is guessing the word... Please wait.
            </p>
          </div>
        </div>

        <div v-if="gameStore.impostorDoneGuessing" class="space-y-4">
          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">Most Voted</h3>
            <p class="text-xl text-white">
              Players voted for:
              <span class="font-bold text-yellow-400">{{
                getMostVotedName()
              }}</span>
              <span class="text-gray-400 ml-2"
                >({{ getMostVotedCount() }} votes)</span
              >
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">
              The Impostor Was
            </h3>
            <p class="text-xl text-white">
              <span class="font-bold text-red-400">{{
                getImpostorName()
              }}</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">
              Category Revealed
            </h3>
            <p class="text-xl text-white">
              <span class="font-bold text-blue-400">{{ category }}</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-2">
              The Word Was
            </h3>
            <p class="text-xl text-white">
              <span class="font-bold text-green-400">{{ word }}</span>
            </p>
          </div>

          <div class="bg-gray-700 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-300 mb-4">
              Vote Results
            </h3>
            <div class="space-y-2">
              <div v-if="!votes || votes.size === 0" class="text-gray-400">
                No votes recorded
              </div>
              <div
                v-else
                v-for="[playerId, voteCount] in votes"
                :key="playerId"
                class="flex justify-between items-center p-2 bg-gray-600 rounded"
              >
                <span class="text-white">{{ getPlayerName(playerId) }}</span>
                <span class="font-bold text-yellow-400"
                  >{{ voteCount }} vote{{ voteCount !== 1 ? "s" : "" }}</span
                >
              </div>
            </div>
          </div>

          <Button
            variant="success"
            full-width
            @click="$router.push('/')"
            class="mt-4 text-lg font-bold py-3"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { useRoute } from "vue-router";
import { useGameStore } from "../stores/game.store.js";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store.js";
import { getSocket } from "@/shared/utils/socket.js";
import { GameClientService } from "@/shared/services/game-client.service.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { PlayerDTO } from "@/shared/types/game.js";
import {
  getGameSession,
  clearGameSession,
} from "@/shared/utils/session-storage.js";
import { useClipboard } from "@/shared/composables/use-clipboard.js";
import { MAX_ROUNDS, MIN_PLAYERS } from "@/shared/utils/constants.js";
import { usePlayerHelpers } from "../composables/use-player-helpers.js";
import Button from "@/shared/components/button.vue";
import VotingPhase from "../components/voting-phase.vue";
import RevealPhase from "../components/reveal-phase.vue";
import ImpostorGuessPhase from "../components/impostor-guess-phase.vue";
import PlayerSelectionList from "../components/player-selection-list.vue";

const playerWordInput = ref<string>("");
const { copyToClipboard: copyToClip } = useClipboard();
const showCopiedSnackbar = ref(false);

const route = useRoute();
const gameStore = useGameStore();
const lobbyStore = useLobbyStore();
const gameId = route.params.gameId as string;

const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket);
provide("gameClientService", gameClientService);

const status = computed(() => gameStore.status);
const currentRound = computed(() => gameStore.currentRound);
const category = computed(() => gameStore.category);
const word = computed(() => gameStore.word);
const isImpostor = computed(() => gameStore.isImpostor);
const players = computed<PlayerDTO[]>(() => gameStore.players);
const finalScores = computed(() => gameStore.finalScores);
const myPlayerId = computed(() => gameStore.myPlayerId);
const joinStatus = computed(() => gameStore.joinStatus);
const pendingJoinRequests = computed(() => gameStore.pendingJoinRequests);
const canStartGame = computed(() => players.value.length >= MIN_PLAYERS);
const votes = computed(() => gameStore.votes);
const currentPlayer = computed(() => gameStore.currentPlayer);
const canShowShowImpostorButton = computed(
  () => gameStore.canShowShowImpostorButton,
);
const playersClickedThisRound = computed(
  () => gameStore.playersClickedThisRound,
);
const hasPlayerClicked = computed(() => {
  return currentPlayer.value
    ? gameStore.hasPlayerClickedThisRound(currentPlayer.value.id)
    : false;
});
const isMyTurn = computed(() => currentPlayer.value?.id === myPlayerId.value);
const isNextButtonBlocked = computed(() => gameStore.isNextButtonBlocked);
const selectedImpostorGuess = computed(() => gameStore.selectedImpostorGuess);
const playerWords = computed(() => gameStore.playerWords);

const { getPlayerName, getMostVotedName, getMostVotedCount, getImpostorName } =
  usePlayerHelpers();

function hasPlayerWord(id: string) {
  return playerWords.value.has(id);
}
function startGame() {
  const socket = getSocket();
  socket.emit("startGame", { gameId });
}

function copyGameIdToClipboard() {
  copyToClip(gameId);
  showCopiedSnackbar.value = true;
  setTimeout(() => {
    showCopiedSnackbar.value = false;
  }, 2000);
}

function handleNextPerson() {
  const player = currentPlayer.value;
  const word = playerWordInput.value.trim();
  console.log(
    "[NextPerson] player:",
    player?.id,
    "word:",
    word,
    "isMyTurn:",
    isMyTurn.value,
  );

  if (!player || !word) {
    console.warn("[NextPerson] guard failed — player:", player, "word:", word);
    return;
  }

  const playerId = player.id;

  gameStore.submitPlayerWord(playerId, playerWordInput.value);
  gameClientService.submitPlayerWord(
    gameId,
    playerId,
    playerWordInput.value,
    gameStore.currentRound,
  );
  playerWordInput.value = "";

  gameStore.advancePlayerTurn(playerId);
  gameClientService.advanceTurn(
    gameId,
    playerId,
    gameStore.currentPlayerIndex,
    Array.from(gameStore.playersClickedThisRound),
    gameStore.isNextButtonBlocked,
  );

  if (
    gameStore.currentRound === MAX_ROUNDS &&
    gameStore.playersClickedThisRound.size === gameStore.players.length
  ) {
    gameStore.setStatus(GameStatus.VOTING);
    gameClientService.transitionToVoting(gameId);
  }
}

function handleShowImpostor() {
  gameStore.setStatus(GameStatus.VOTING);
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

  const session = getGameSession();
  if (session && session.gameId === gameId) {
    gameStore.setJoinStatus("pending");
    gameClientService.rejoinGame(gameId, session.playerId);
    return;
  } else if (session) {
    clearGameSession();
  }

  const playerName = lobbyStore.playerName;
  if (playerName.trim()) {
    gameStore.setJoinStatus("pending");
    gameClientService.requestJoin(gameId, playerName);
  }
});
</script>
