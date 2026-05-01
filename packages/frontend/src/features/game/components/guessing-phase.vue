<template>
  <div class="space-y-4">
    <div v-if="isImpostor">
      <div class="bg-gray-700 rounded-lg shadow p-6">
        <h3 class="text-xl font-bold mb-4 text-white">Impostor's Turn to Guess</h3>
        <p class="text-gray-400 mb-6">
          Impostor, what do you think the word is? (One chance)
        </p>

        <form v-if="!hasGuessed" @submit.prevent="submit" class="space-y-4">
          <input
            v-model="guess"
            type="text"
            class="w-full px-4 py-2 border border-gray-600 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your guess..."
            :disabled="isGuessing"
          />
          <Button type="submit" full-width :disabled="!guess || isGuessing">
            {{ isGuessing ? "Submitting..." : "Submit Guess" }}
          </Button>
        </form>

        <div v-else class="p-4 bg-blue-900 rounded border border-blue-600">
          <p class="text-blue-400 font-bold text-lg">Guess submitted!</p>
        </div>
      </div>
    </div>
    <div v-else class="bg-gray-700 rounded-lg shadow p-6">
      <h3 class="text-xl font-bold mb-4 text-white">
        Waiting for Impostor
      </h3>
      <p class="text-gray-400">
        The impostor is guessing the word... Please wait.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameState } from "../composables/use-game-state.js";
import { useGameStore } from "../stores/game.store.js";
import Button from "@/shared/components/button.vue";

interface Props {
  isImpostor: boolean;
}

const props = defineProps<Props>();

const { guessWord } = useGameState();
const gameStore = useGameStore();
const guess = ref("");
const isGuessing = ref(false);
const hasGuessed = ref(false);

async function submit() {
  if (!guess.value.trim()) return;

  isGuessing.value = true;
  try {
    const userGuess = guess.value.toLowerCase().trim();
    guessWord(userGuess);
    hasGuessed.value = true;
  } finally {
    isGuessing.value = false;
  }
}
</script>
