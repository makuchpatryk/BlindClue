<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="createGame" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Number of Rounds
        </label>
        <input
          v-model.number="numberOfRounds"
          type="number"
          min="1"
          max="10"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
        />
      </div>
      <Button type="submit" full-width :disabled="isCreating">
        {{ isCreating ? "Creating..." : "Create Game" }}
      </Button>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLobbyStore } from "../stores/lobby.store.js";
import { useGameFacade } from "@/features/game/composables/use-game-facade.js";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/shared/utils/constants.js";
import { useFormSubmission } from "../composables/use-form-submission.js";
import Button from "@/shared/components/button.vue";

const router = useRouter();
const lobbyStore = useLobbyStore();
const { gameStore } = useGameFacade();
const numberOfRounds = ref<number>(lobbyStore.numberOfRounds);
const {
  isLoading: isCreating,
  error,
  executeWithErrorHandling,
} = useFormSubmission();

async function createGame() {
  if (!lobbyStore.playerName.trim()) {
    error.value = "Please enter your name";
    return;
  }

  await executeWithErrorHandling(async () => {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numberOfRounds: numberOfRounds.value,
      }),
    });

    if (!response.ok) throw new Error("Failed to create game");

    const data = await response.json();
    const gameId = data.gameId;

    gameStore.resetForNewGame();
    lobbyStore.setGameCode(gameId);
    lobbyStore.setNumberOfRounds(numberOfRounds.value);
    await router.push(`/${gameId}`);
  });
}
</script>
