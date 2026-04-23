<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold mb-4">Vote for the Impostor</h3>
    <p class="text-gray-600 mb-6">Who do you think is the impostor?</p>

    <div class="space-y-3">
      <button
        v-for="player in players"
        :key="player.id"
        @click="vote(player.id)"
        :disabled="isVoting"
        class="w-full p-4 text-left border-2 border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 transition"
      >
        <span class="font-semibold">{{ player.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameState } from '../composables/use-game-state.js';

const { voteImpostor, players } = useGameState();
const isVoting = ref(false);

async function vote(playerId: string) {
  isVoting.value = true;
  try {
    voteImpostor(playerId);
  } finally {
    isVoting.value = false;
  }
}
</script>
