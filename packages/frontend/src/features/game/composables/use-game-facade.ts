import { inject } from "vue";
import { useGameStore } from "../stores/game.store.js";
import { GameClientService } from "@/features/game/services/game-client.service.js";

export function useGameFacade() {
  const gameStore = useGameStore();
  const gameClientService = inject<GameClientService>("gameClientService");

  const submitDescription = (description: string) => {
    if (gameClientService && gameStore.myPlayerId) {
      gameClientService.submitDescription(
        gameStore.gameId,
        gameStore.myPlayerId,
        description,
      );
    }
  };

  const voteImpostor = (votedForId: string) => {
    if (gameClientService && gameStore.myPlayerId) {
      gameClientService.voteImpostor(
        gameStore.gameId,
        gameStore.myPlayerId,
        votedForId,
      );
    }
  };

  const guessWord = (word: string) => {
    if (gameClientService) {
      gameClientService.guessWord(gameStore.gameId, word);
    }
  };

  return {
    gameStore,
    submitDescription,
    voteImpostor,
    guessWord,
  };
}
