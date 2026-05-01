import { computed } from "vue";
import { useGameStore } from "../stores/game.store.js";

export function usePlayerHelpers() {
  const gameStore = useGameStore();
  const players = computed(() => gameStore.players);

  const getPlayerName = (playerId: string): string => {
    const player = players.value.find((p) => p.id === playerId);
    return player?.name || "Unknown";
  };

  const getMostVotedName = (): string => {
    if (!gameStore.mostVoted) return "Unknown";
    return getPlayerName(gameStore.mostVoted);
  };

  const getMostVotedCount = (): number => {
    if (!gameStore.mostVoted || !gameStore.votes) return 0;
    return gameStore.votes.get(gameStore.mostVoted) || 0;
  };

  const getImpostorName = (): string => {
    if (!gameStore.impostorId) return "Unknown";
    return getPlayerName(gameStore.impostorId);
  };

  return {
    getPlayerName,
    getMostVotedName,
    getMostVotedCount,
    getImpostorName,
  };
}
