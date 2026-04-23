<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Round {{ currentRound }}/3</h2>
      <p class="text-lg font-semibold text-blue-600">Category: {{ category }}</p>
    </div>

    <div class="mb-6 p-4 bg-blue-50 rounded">
      <p v-if="!isImpostor" class="text-lg">You know the word. Give a description!</p>
      <p v-else class="text-lg text-red-600">You are the Impostor. Listen and figure out the word.</p>
    </div>

    <div class="space-y-4">
      <h3 class="font-semibold text-gray-700">Players in this round:</h3>
      <ul class="space-y-2">
        <li v-for="player in players" :key="player.id" class="flex items-center p-2 bg-gray-50 rounded">
          <span class="font-medium">{{ player.name }}</span>
          <span v-if="player.id === impostorId" class="ml-auto px-2 py-1 bg-red-100 text-red-600 rounded text-sm">
            Impostor?
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameState } from '../composables/use-game-state.js';

const { currentRound, category, isImpostor, players, impostorId } = useGameState();
</script>
