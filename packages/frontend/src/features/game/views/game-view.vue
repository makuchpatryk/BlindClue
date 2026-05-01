<template>
  <div class="max-w-4xl mx-auto">
    <CopiedSnackbar :show="showCopiedSnackbar" />
    <JoinWaitingModal :show="joinStatus === 'pending'" />
    <JoinApprovalModal
      :show="pendingJoinRequests.length > 0"
      :pending-request="pendingJoinRequests[0] || null"
      @approve="approveJoin"
      @reject="rejectJoin"
    />

    <div class="bg-gray-800 rounded-lg shadow p-6 text-gray-100">
      <LobbyPhase
        v-if="status === GameStatus.LOBBY"
        @copy-game-id="copyGameIdToClipboard"
        @start-game="startGame"
      />

      <RunningPhase
        v-else-if="status === GameStatus.RUNNING"
        @next-person="handleNextPerson"
        @show-impostor="handleShowImpostor"
      />

      <VotingPhase v-else-if="status === GameStatus.VOTING" />

      <GuessingPhase
        v-else-if="status === GameStatus.GUESSING"
        :is-impostor="gameStore.isImpostor"
      />

      <EndedPhase
        v-else-if="status === GameStatus.ENDED"
        @play-again="playAgain"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGameStore } from "../stores/game.store.js";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store.js";
import { getSocket } from "@/shared/utils/socket.js";
import { GameClientService } from "@/shared/services/game-client.service.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import {
  getGameSession,
  clearGameSession,
} from "@/shared/utils/session-storage.js";
import { useClipboard } from "@/shared/composables/use-clipboard.js";
import LobbyPhase from "../components/lobby-phase.vue";
import RunningPhase from "../components/running-phase.vue";
import VotingPhase from "../components/voting-phase.vue";
import GuessingPhase from "../components/guessing-phase.vue";
import EndedPhase from "../components/ended-phase.vue";
import CopiedSnackbar from "../components/copied-snackbar.vue";
import JoinWaitingModal from "../components/join-waiting-modal.vue";
import JoinApprovalModal from "../components/join-approval-modal.vue";

const { copyToClipboard: copyToClip } = useClipboard();
const showCopiedSnackbar = ref(false);

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const lobbyStore = useLobbyStore();
const gameId = route.params.gameId as string;

const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket);
provide("gameClientService", gameClientService);

const status = computed(() => gameStore.status);
const joinStatus = computed(() => gameStore.joinStatus);
const pendingJoinRequests = computed(() => gameStore.pendingJoinRequests);

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

function handleNextPerson(word: string) {
  const player = gameStore.currentPlayer;
  if (!player) return;

  const playerId = player.id;
  gameStore.submitPlayerWord(playerId, word);
  gameClientService.submitPlayerWord(
    gameId,
    playerId,
    word,
    gameStore.currentRound,
  );

  gameStore.advancePlayerTurn(playerId);
  gameClientService.advanceTurn(
    gameId,
    playerId,
    gameStore.currentPlayerIndex,
    Array.from(gameStore.playersClickedThisRound),
    gameStore.isNextButtonBlocked,
  );

  if (
    gameStore.currentRound === gameStore.numberOfRounds &&
    gameStore.playersClickedThisRound.size === gameStore.players.length
  ) {
    gameStore.setStatus(GameStatus.VOTING);
    gameClientService.transitionToVoting(gameId);
  }
}

function handleShowImpostor() {
  gameStore.setStatus(GameStatus.VOTING);
  gameClientService.transitionToVoting(gameId);
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

function playAgain() {
  router.push("/");
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
