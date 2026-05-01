<
<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="createGame" class="space-y-4">
      <Button type="submit" full-width :disabled="isCreating">
        {{ isCreating ? "Creating..." : "Create Game" }}
      </Button>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useLobbyStore } from "../stores/lobby.store.js";
import { useGameStore } from "@/features/game/stores/game.store.js";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/shared/utils/constants.js";
import { useFormSubmission } from "../composables/use-form-submission.js";
import Button from "@/shared/components/button.vue";

const router = useRouter();
const lobbyStore = useLobbyStore();
const gameStore = useGameStore();
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
    });

    if (!response.ok) throw new Error("Failed to create game");

    const data = await response.json();
    const gameId = data.gameId;

    gameStore.resetForNewGame();
    lobbyStore.setGameCode(gameId);
    await router.push(`/${gameId}`);
  });
}
</script>
