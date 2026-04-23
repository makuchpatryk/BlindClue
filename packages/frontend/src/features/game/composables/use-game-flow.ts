import { computed } from 'vue';
import { useGameStore } from '../stores/game.store.js';

export function useGameFlow() {
  const gameStore = useGameStore();

  const isLobby = computed(() => gameStore.status === 'LOBBY');
  const isRunning = computed(() => gameStore.status === 'RUNNING');
  const isVoting = computed(() => gameStore.status === 'VOTING');
  const isEnded = computed(() => gameStore.status === 'ENDED');

  const canStartGame = computed(() => {
    return isLobby.value && gameStore.players.length >= 2;
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
