<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-white mb-6">Game Over</h2>

    <div class="space-y-4">
      <div class="bg-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">Most Voted</h3>
        <p class="text-xl text-white">
          Players voted for:
          <span class="font-bold text-yellow-400">{{
            getMostVotedName()
          }}</span>
          <span class="text-gray-400 ml-2"
            >({{ getMostVotedCount() }} votes)</span
          >
        </p>
      </div>

      <div class="bg-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">
          The Impostor Was
        </h3>
        <p class="text-xl text-white">
          <span class="font-bold text-red-400">{{
            getImpostorName()
          }}</span>
        </p>
      </div>

      <div class="bg-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-300 mb-2">
          The Word Was
        </h3>
        <p class="text-xl text-white">
          <span class="font-bold text-green-400">{{ word }}</span>
        </p>
      </div>

      <div class="bg-gray-700 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-300 mb-4">
          Vote Results
        </h3>
        <div class="space-y-2">
          <div
            v-for="[playerId, voteCount] in votes"
            :key="playerId"
            class="flex justify-between items-center p-2 bg-gray-600 rounded"
          >
            <span class="text-white">{{ getPlayerName(playerId) }}</span>
            <span class="font-bold text-yellow-400"
              >{{ voteCount }} vote{{ voteCount !== 1 ? "s" : "" }}</span
            >
          </div>
        </div>
      </div>

      <Button
        variant="success"
        full-width
        @click="playAgain"
        class="mt-4 text-lg font-bold py-3"
      >
        Play Again
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameFacade } from "../composables/use-game-facade.js";
import { usePlayerHelpers } from "../composables/use-player-helpers.js";
import Button from "@/shared/components/button.vue";

const { gameStore } = useGameFacade();
const { getPlayerName, getMostVotedName, getMostVotedCount, getImpostorName } =
  usePlayerHelpers();

const emit = defineEmits<{
  playAgain: [];
}>();

const category = computed(() => gameStore.category);
const word = computed(() => gameStore.word);
const votes = computed(() => gameStore.votes);

function playAgain() {
  emit("playAgain");
}
</script>
