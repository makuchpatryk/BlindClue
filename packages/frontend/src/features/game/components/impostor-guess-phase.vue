<template>
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
      <button
        type="submit"
        :disabled="!guess || isGuessing"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isGuessing ? "Submitting..." : "Submit Guess" }}
      </button>
    </form>

    <div v-else class="space-y-4">
      <div
        v-if="isCorrect"
        class="p-4 bg-green-900 rounded border border-green-600"
      >
        <p class="text-green-400 font-bold text-lg">✓ Correct!</p>
        <p class="text-green-300">You guessed the word right!</p>
      </div>
      <div v-else class="p-4 bg-red-900 rounded border border-red-600">
        <p class="text-red-400 font-bold text-lg">✗ Wrong!</p>
        <p class="text-red-300">
          The word was:
          <span class="font-bold text-red-200">{{ actualWord }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameState } from "../composables/use-game-state.js";
import { useGameStore } from "../stores/game.store.js";

const { guessWord } = useGameState();
const gameStore = useGameStore();
const guess = ref("");
const isGuessing = ref(false);
const hasGuessed = ref(false);
const isCorrect = ref(false);
const actualWord = computed(() => gameStore.word || "");

async function submit() {
  if (!guess.value.trim()) return;

  isGuessing.value = true;
  try {
    const userGuess = guess.value.toLowerCase().trim();
    const correct = userGuess === (gameStore.word || "").toLowerCase();

    isCorrect.value = correct;
    hasGuessed.value = true;

    guessWord(userGuess);
  } finally {
    isGuessing.value = false;
  }
}
</script>
