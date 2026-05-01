<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-white">Waiting for players...</h2>
    <div class="flex items-center gap-2">
      <p class="text-gray-400">
        Game Code:
        <code class="font-mono font-bold text-blue-400">{{ gameStore.gameId }}</code>
      </p>
      <Button
        :no-defaults="true"
        @click="copyGameIdToClipboard"
        class="p-1 text-gray-400 hover:text-blue-400 transition"
        title="Copy game ID"
      >
        📋
      </Button>
    </div>
    <div class="mt-4">
      <h3 class="font-semibold mb-2 text-gray-300">Players:</h3>
      <ul class="space-y-2">
        <li v-for="p in gameStore.players" :key="p.id" class="text-gray-400">
          [{{ p.id.slice(0, 4).toUpperCase() }}] {{ p.name }}
        </li>
      </ul>
    </div>
    <Button
      v-if="canStartGame"
      variant="success"
      full-width
      @click="startGame"
    >
      Start Game
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../stores/game.store.js";
import { MIN_PLAYERS } from "@/shared/utils/constants.js";
import Button from "@/shared/components/button.vue";

const gameStore = useGameStore();

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
