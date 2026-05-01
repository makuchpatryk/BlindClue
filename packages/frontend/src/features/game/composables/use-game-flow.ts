import { computed } from "vue";
import { useGameStore } from "../stores/game.store.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { MIN_PLAYERS } from "@/shared/utils/constants.js";

export function useGameFlow() {
  const gameStore = useGameStore();

  const isLobby = computed(() => gameStore.status === GameStatus.LOBBY);
  const isRunning = computed(() => gameStore.status === GameStatus.RUNNING);
  const isVoting = computed(() => gameStore.status === GameStatus.VOTING);
  const isEnded = computed(() => gameStore.status === GameStatus.ENDED);

  const canStartGame = computed(() => {
    return isLobby.value && gameStore.players.length >= MIN_PLAYERS;
  });

  const canSubmitDescription = computed(() => {
    return isRunning.value && gameStore.currentRound <= 3;
  });

  const canVote = computed(() => {
    return isVoting.value;
  });

  return {
    isLobby,
    isRunning,
    isVoting,
    isEnded,
    canStartGame,
    canSubmitDescription,
    canVote,
  };
}
