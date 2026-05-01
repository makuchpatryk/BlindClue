<template>
  <div class="bg-gray-700 rounded-lg shadow p-6">
    <h3 class="text-2xl font-bold mb-4 text-white text-center">
      Who is the impostor?
    </h3>
    <p class="text-gray-400 mb-6 text-center">
      Select a player and confirm your vote
    </p>

    <PlayerSelectionList :disabled="isVoting" />

    <div v-if="selectedPlayerId" class="mt-6">
      <Button
        variant="success"
        full-width
        @click="vote"
        :disabled="isVoting"
        class="text-lg font-bold py-3"
      >
        {{ isVoting ? "Voting..." : "Show Impostor" }}
      </Button>
    </div>
    <div v-else class="mt-6">
      <Button
        variant="secondary"
        full-width
        disabled
        class="text-lg font-bold py-3"
      >
        Select a player first
      </Button>
      <p class="text-sm text-gray-400 text-center mt-2">
        Choose who you think the impostor is above
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useGameStore } from "../stores/game.store.js";
import { useGameState } from "../composables/use-game-state.js";
import { GameClientService } from "@/shared/services/game-client.service.js";
import { GameStatus } from "@/shared/utils/game-status.js";
import Button from "@/shared/components/button.vue";
import PlayerSelectionList from "./player-selection-list.vue";

const { voteImpostor } = useGameState();
const gameStore = useGameStore();
const gameClientService = inject<GameClientService>("gameClientService");
const isVoting = ref(false);

const selectedPlayerId = computed(() => gameStore.selectedImpostorGuess);

async function vote() {
  if (!selectedPlayerId.value) return;

  isVoting.value = true;
  try {
    gameStore.addVotedPlayer(gameStore.myPlayerId);
    gameClientService?.broadcastPlayerVoted(
      gameStore.gameId,
      gameStore.myPlayerId,
    );
    voteImpostor(selectedPlayerId.value);

    if (gameStore.votedPlayersThisRound.size === gameStore.players.length) {
        gameStore.setStatus();
        gameClientService?.allPlayersVoted(gameStore.gameId);
    }
  } finally {
    isVoting.value = false;
  }
}
</script>
