<template>
  <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow">
    <form @submit.prevent="createGame" class="space-y-4">
      <FormField label="Number of Rounds">
        <Input v-model.number="numberOfRounds" type="number" />
      </FormField>
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
import { useFormSubmission } from "../composables/use-form-submission.js";
import { httpClient } from "@/core/http-client.js";
import Button from "@/shared/components/button.vue";
import FormField from "@/shared/components/form-field.vue";
import Input from "@/shared/components/input.vue";

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
    const data = await httpClient.post<{ gameId: string }>("/api/games", {
      numberOfRounds: numberOfRounds.value,
    });

    const gameId = data.gameId;

    gameStore.resetForNewGame();
    lobbyStore.setGameCode(gameId);
    lobbyStore.setNumberOfRounds(numberOfRounds.value);
    await router.push(`/${gameId}`);
  });
}
</script>
