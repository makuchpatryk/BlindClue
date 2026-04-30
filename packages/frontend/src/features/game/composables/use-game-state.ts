import { computed, inject } from 'vue';
import { useGameStore } from '../stores/game.store.js';
import { GameClientService } from '../../shared/services/game-client.service.js';

export function useGameState() {
  const gameStore = useGameStore();
  const gameClientService = inject<GameClientService>('gameClientService');

  const currentRound = computed(() => gameStore.currentRound);
  const status = computed(() => gameStore.status);
  const players = computed(() => gameStore.players);
  const isImpostor = computed(() => gameStore.isImpostor);
  const category = computed(() => gameStore.category);
  const impostorId = computed(() => gameStore.impostorId);
  const descriptions = computed(() => gameStore.descriptions);
  const votes = computed(() => gameStore.votes);
  const mostVoted = computed(() => gameStore.mostVoted);
  const finalScores = computed(() => gameStore.finalScores);
  const myPlayerId = computed(() => gameStore.myPlayerId);

  const submitDescription = (description: string) => {
    const gameId = gameStore.gameId;
    const playerId = myPlayerId.value;
    if (gameClientService && playerId) {
      gameClientService.submitDescription(gameId, playerId, description);
    }
  };

  const voteImpostor = (votedForId: string) => {
    const gameId = gameStore.gameId;
    const playerId = myPlayerId.value;
    if (gameClientService && playerId) {
      gameClientService.voteImpostor(gameId, playerId, votedForId);
    }
  };

  const guessWord = (word: string) => {
    const gameId = gameStore.gameId;
    if (gameClientService) {
      gameClientService.guessWord(gameId, word);
    }
  };

  return {
    currentRound,
    status,
    players,
    isImpostor,
    category,
    impostorId,
    descriptions,
    votes,
    mostVoted,
    finalScores,
    myPlayerId,
    submitDescription,
    voteImpostor,
    guessWord,
  };
}
