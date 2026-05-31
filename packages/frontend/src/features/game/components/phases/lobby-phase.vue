<template>
  <div class="space-y-4">
    <Heading :level="2">Waiting for players...</Heading>
    <p class="text-gray-400">
      Game Code:
      <code
        class="font-mono font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition"
        @click="copyGameIdToClipboard"
        title="Click to copy game ID"
      >
        {{ gameStore.gameId }}
      </code>
    </p>
    <div class="mt-4">
      <h3 class="font-semibold mb-2 text-gray-300">Players:</h3>
      <ul class="space-y-2">
        <li v-for="p in gameStore.players" :key="p.id" class="text-gray-400 flex items-center gap-2">
          <AvatarBadge :avatar="p.avatar" size="small" />
          <span>[{{ p.id.slice(0, 4).toUpperCase() }}] {{ p.name }}</span>
        </li>
      </ul>
    </div>
    <Button v-if="canStartGame" variant="success" full-width @click="startGame">
      Start Game
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameFacade } from "../../composables/use-game-facade.js";
import { MIN_PLAYERS } from "@/shared/utils/constants.js";
import Button from "@/shared/components/button.vue";
import Heading from "@/shared/components/heading.vue";
import AvatarBadge from "@/shared/components/avatar-badge.vue";

const { gameStore } = useGameFacade();

const emit = defineEmits<{
  copyGameId: [];
  startGame: [];
}>();

const canStartGame = computed(() => gameStore.players.length >= MIN_PLAYERS);

function copyGameIdToClipboard() {
  emit("copyGameId");
}

function startGame() {
  emit("startGame");
}
</script>
