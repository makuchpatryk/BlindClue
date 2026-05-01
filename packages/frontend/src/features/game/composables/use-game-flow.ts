import { computed } from "vue";
import { useGameStore } from "../stores/game.store.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import { MIN_PLAYERS } from "@/shared/utils/constants.js";

export function useGameFlow() {
  const gameStore = useGameStore();

  const isLobby = computed(() => gameStore.status === GameStatus.LOBBY);
  const isRunning = computed(() => gameStore.status === GameStatus.RUNNING);
  const isVoting = computed(() => gameStore.status === GameStatus.VOTING);
  const isGuessing = computed(() => gameStore.status === GameStatus.GUESSING);
  const isEnded = computed(() => gameStore.status === GameStatus.ENDED);

  const canStartGame = computed(() => {
    return isLobby.value && gameStore.players.length >= MIN_PLAYERS;
  });

  const canSubmitDescription = computed(() => {
    return (
      isRunning.value && gameStore.currentRound <= gameStore.numberOfRounds
    );
  });

  const canVote = computed(() => {
    return isVoting.value;
  });

  const canGuess = computed(() => {
    return isGuessing.value;
  });

  return {
    isLobby,
    isRunning,
    isVoting,
    isGuessing,
    isEnded,
    canStartGame,
    canSubmitDescription,
    canVote,
    canGuess,
  };
}
