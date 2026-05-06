<template>
  <div class="max-w-4xl mx-auto">
    <CopiedSnackbar :show="showCopiedSnackbar" />
    <JoinWaitingModal :show="joinStatus === JoinStatus.PENDING" />
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
        :is-impostor="isImpostor"
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
import { useRouter } from "vue-router";
import { useGameFacade } from "../composables/use-game-facade.js";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store.js";
import { getSocket } from "@/shared/utils/socket.js";
import { GameClientService } from "@/features/game/services/game-client.service.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { JoinStatus } from "@/shared/types/game.js";
import {
  getGameSession,
  clearGameSession,
} from "@/shared/utils/session-storage.js";
import { useClipboard } from "@/shared/composables/use-clipboard.js";
import LobbyPhase from "./lobby-phase.vue";
import RunningPhase from "./running-phase.vue";
import VotingPhase from "./voting-phase.vue";
import GuessingPhase from "./guessing-phase.vue";
import EndedPhase from "./ended-phase.vue";
import CopiedSnackbar from "./copied-snackbar.vue";
import JoinWaitingModal from "./join-waiting-modal.vue";
import JoinApprovalModal from "./join-approval-modal.vue";

interface Props {
  gameId: string;
}

const props = defineProps<Props>();

const { copyToClipboard: copyToClip } = useClipboard();
const showCopiedSnackbar = ref(false);

const router = useRouter();
const { gameStore } = useGameFacade();
const lobbyStore = useLobbyStore();

const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket, gameStore);
provide("gameClientService", gameClientService);

const status = computed(() => gameStore.status);
const joinStatus = computed(() => gameStore.joinStatus);
const pendingJoinRequests = computed(() => gameStore.pendingJoinRequests);
const isImpostor = computed(() => gameStore.isImpostor);
const currentPlayer = computed(() => gameStore.currentPlayer);

function startGame() {
  gameClientService.startGame(props.gameId);
}

function copyGameIdToClipboard() {
  copyToClip(props.gameId);
  showCopiedSnackbar.value = true;
  setTimeout(() => {
    showCopiedSnackbar.value = false;
  }, 2000);
}

function handleNextPerson(word: string) {
  const player = currentPlayer.value;
  if (!player) return;

  const playerId = player.id;
  gameStore.submitPlayerWord(playerId, word);
  gameClientService.submitPlayerWord(
    props.gameId,
    playerId,
    word,
    gameStore.currentRound,
  );

  gameStore.advancePlayerTurn(playerId);
  gameClientService.advanceTurn(
    props.gameId,
    playerId,
    gameStore.currentPlayerIndex,
    Array.from(gameStore.playersClickedThisRound),
    gameStore.isNextButtonBlocked,
  );

  if (
    gameStore.currentRound === gameStore.numberOfRounds &&
    gameStore.playersClickedThisRound.size === gameStore.players.length
  ) {
    handleShowImpostor();
  }
}

function handleShowImpostor() {
  gameStore.setStatus();
  gameClientService.transitionToVoting(props.gameId);
}

function approveJoin(requestId: string) {
  gameClientService.approveJoin(requestId, props.gameId);
  gameStore.removeJoinRequest(requestId);
}

function rejectJoin(requestId: string) {
  gameClientService.rejectJoin(requestId);
  gameStore.removeJoinRequest(requestId);
}

function playAgain() {
  router.push("/");
}

onMounted(async () => {
  gameStore.gameId = props.gameId;

  const session = getGameSession();
  if (session && session.gameId === props.gameId) {
    gameStore.setJoinStatus(JoinStatus.PENDING);
    gameClientService.rejoinGame(props.gameId, session.playerId);
    return;
  } else if (session) {
    clearGameSession();
  }

  const playerName = lobbyStore.playerName;
  if (playerName.trim()) {
    gameStore.setJoinStatus(JoinStatus.PENDING);
    gameClientService.requestJoin(props.gameId, playerName);
  }
});
</script>
