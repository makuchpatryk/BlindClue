<template>
  <div class="space-y-3">
    <button
      v-for="player in players"
      :key="player.id"
      @click="selectPlayer(player.id)"
      :disabled="disabled"
      :class="[
        'w-full p-4 text-left border-2 rounded font-semibold transition text-white',
        selectedPlayerId === player.id
          ? 'border-yellow-400 bg-yellow-900 hover:bg-yellow-800'
          : 'border-gray-600 bg-gray-700 hover:border-blue-400 hover:bg-gray-600',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <div class="flex items-center justify-between">
        <span>{{ player.name }}</span>
        <span v-if="selectedPlayerId === player.id" class="text-yellow-300">✓</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game.store.js';
import { useGameState } from '../composables/use-game-state.js';
import type { PlayerDTO } from '../../shared/types/game.js';

interface Props {
  disabled?: boolean;
}

defineProps<Props>();

const gameStore = useGameStore();
const { players } = useGameState();

const selectedPlayerId = computed(() => gameStore.selectedImpostorGuess);

function selectPlayer(playerId: string) {
  gameStore.selectImpostorGuess(playerId);
}
</script>
