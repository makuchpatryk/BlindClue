<template>
  <div class="space-y-3">
    <Button
      v-for="player in players"
      :key="player.id"
      :disabled="disabled"
      :no-defaults="true"
      @click="selectPlayer(player.id)"
      :class="[
        'w-full p-4 text-left border-2 rounded font-semibold transition text-white',
        selectedPlayerId === player.id
          ? 'border-yellow-400 bg-yellow-900 hover:bg-yellow-800'
          : 'border-gray-600 bg-gray-700 hover:border-blue-400 hover:bg-gray-600',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <AvatarBadge :avatar="player.avatar" size="small" />
          <span>{{ player.name }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="gameStore.hasPlayerVoted(player.id)"
            class="text-green-400"
            title="Player voted"
            >✔️</span
          >
          <span v-if="selectedPlayerId === player.id" class="text-yellow-300"
            >✓</span
          >
        </div>
      </div>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameFacade } from "../composables/use-game-facade.js";
import Button from "@/shared/components/button.vue";
import AvatarBadge from "@/shared/components/avatar-badge.vue";
import type { PlayerDTO } from "@/shared/types/game.js";

interface Props {
  disabled?: boolean;
}

defineProps<Props>();

const { gameStore } = useGameFacade();

const selectedPlayerId = computed(() => gameStore.selectedImpostorGuess);
const players = computed(() => gameStore.players);

function selectPlayer(playerId: string) {
  gameStore.selectImpostorGuess(playerId);
}
</script>
