<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold mb-4">Impostor's Turn to Guess</h3>
    <p class="text-gray-600 mb-6">Impostor, what do you think the word is?</p>

    <form @submit.prevent="submit" class="space-y-4">
      <input
        v-model="guess"
        type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your guess..."
        :disabled="isGuessing"
      />
      <button
        type="submit"
        :disabled="!guess || isGuessing"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isGuessing ? 'Submitting...' : 'Submit Guess' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameState } from '../composables/use-game-state.js';

const { guessWord } = useGameState();
const guess = ref('');
const isGuessing = ref(false);

async function submit() {
  if (!guess.value.trim()) return;

  isGuessing.value = true;
  try {
    guessWord(guess.value);
    guess.value = '';
  } finally {
    isGuessing.value = false;
  }
}
</script>
