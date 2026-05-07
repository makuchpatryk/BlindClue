<template>
  <div class="max-w-4xl mx-auto">
    <CopiedSnackbar :show="showCopiedSnackbar" />
    <JoinWaitingModal :show="gameStore.joinStatus === JoinStatus.PENDING" />
    <JoinApprovalModal
      :show="gameStore.pendingJoinRequests.length > 0"
      :pending-request="gameStore.pendingJoinRequests[0] || null"
      @approve="approveJoin"
      @reject="rejectJoin"
    />

    <div class="bg-gray-800 rounded-lg shadow p-6 text-gray-100">
      <component
        :is="phaseConfig.component"
        v-bind="phaseConfig.props"
        v-on="phaseConfig.listeners"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
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
import LobbyPhase from "./phases/lobby-phase.vue";
import RunningPhase from "./phases/running-phase.vue";
import VotingPhase from "./phases/voting-phase.vue";
import GuessingPhase from "./phases/guessing-phase.vue";
import EndedPhase from "./phases/ended-phase.vue";
import CopiedSnackbar from "./copied-snackbar.vue";
import JoinWaitingModal from "./join-waiting-modal.vue";
import JoinApprovalModal from "./join-approval-modal.vue";

const props = defineProps<{
  gameId: string;
}>();

const { copyToClipboard: copyToClip } = useClipboard();
const showCopiedSnackbar = ref(false);

const { gameStore } = useGameFacade();
const lobbyStore = useLobbyStore();

const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket, gameStore);
provide("gameClientService", gameClientService);

interface PhaseConfig {
  component: any;
  props: Record<string, any>;
  listeners: Record<string, (...args: any[]) => void>;
}

function createLobbyPhase(): PhaseConfig {
  return {
    component: LobbyPhase,
    props: {},
    listeners: {
      copyGameId: copyGameIdToClipboard,
      startGame: startGame,
    },
  };
}

function createRunningPhase(): PhaseConfig {
  return {
    component: RunningPhase,
    props: {},
    listeners: {
      nextPerson: handleNextPerson,
      showImpostor: handleShowImpostor,
    },
  };
}

function createVotingPhase(): PhaseConfig {
  return {
    component: VotingPhase,
    props: {},
    listeners: {},
  };
}

function createGuessingPhase(): PhaseConfig {
  return {
    component: GuessingPhase,
    props: { isImpostor: gameStore.isImpostor },
    listeners: {},
  };
}

function createEndedPhase(): PhaseConfig {
  return {
    component: EndedPhase,
    props: {},
    listeners: {
      playAgain,
    },
  };
}

const phaseStrategies: Record<GameStatus, () => PhaseConfig> = {
  [GameStatus.LOBBY]: createLobbyPhase,
  [GameStatus.RUNNING]: createRunningPhase,
  [GameStatus.VOTING]: createVotingPhase,
  [GameStatus.GUESSING]: createGuessingPhase,
  [GameStatus.ENDED]: createEndedPhase,
};

const phaseConfig = computed<PhaseConfig>(() => {
  const strategyFactory = phaseStrategies[gameStore.status];
  return strategyFactory();
});

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
  const player = gameStore.currentPlayer;
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
  gameClientService.restartGame(props.gameId);
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
