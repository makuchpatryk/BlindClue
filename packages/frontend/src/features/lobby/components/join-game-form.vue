<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="joinGame" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1"
          >Game Code</label
        >
        <input
          v-model="gameCode"
          type="text"
          class="w-full px-4 py-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter game code"
          required
        />
      </div>
      <Button type="submit" full-width :disabled="!gameCode || isJoining">
        {{ isJoining ? "Joining..." : "Join Game" }}
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
import { useFormSubmission } from "../composables/use-form-submission.js";
import Button from "@/shared/components/button.vue";

const router = useRouter();
const lobbyStore = useLobbyStore();
const { gameStore } = useGameFacade();
const gameCode = ref("");
const {
  isLoading: isJoining,
  error,
  executeWithErrorHandling,
} = useFormSubmission();

async function joinGame() {
  if (!lobbyStore.playerName.trim()) {
    error.value = "Please enter your name";
    return;
  }

  await executeWithErrorHandling(async () => {
    gameStore.resetForNewGame();
    lobbyStore.setGameCode(gameCode.value);
    await router.push(`/${gameCode.value}`);
  });
}
</script>
