<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-3xl font-bold text-center mb-8">Final Scores</h2>

    <div class="space-y-3">
      <div
        v-for="(score, index) in sortedScores"
        :key="score.playerId"
        class="flex items-center justify-between p-4 bg-gray-50 rounded"
      >
        <div class="flex items-center space-x-4">
          <div class="text-2xl font-bold text-gray-400 w-8">{{ index + 1 }}</div>
          <div>
            <p class="font-semibold text-lg">{{ score.playerName }}</p>
          </div>
        </div>
        <div class="text-3xl font-bold text-blue-600">{{ score.score }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameState } from '../../game/composables/use-game-state.js';

const { finalScores } = useGameState();

const sortedScores = computed(() => {
  return [...finalScores.value].sort((a, b) => b.score - a.score);
});
</script>
