<template>
  <div class="bg-gray-700 rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6 text-white">Votes Revealed</h2>

    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h3 class="font-semibold text-gray-300 mb-4">Vote Results</h3>
        <div class="space-y-2">
          <div v-if="!votes" class="text-gray-400">Loading votes...</div>
          <div
            v-else
            v-for="[playerId, voteCount] in votes"
            :key="playerId"
            class="flex justify-between p-2 bg-gray-600 rounded text-gray-200"
          >
            <span class="font-medium">{{ getPlayerName(playerId) }}</span>
            <span class="font-bold"
              >{{ voteCount }} vote{{ voteCount !== 1 ? "s" : "" }}</span
            >
          </div>
        </div>
      </div>

      <div>
        <h3 class="font-semibold text-gray-300 mb-4">Most Voted</h3>
        <div v-if="mostVoted" class="p-4 bg-red-900 rounded text-center">
          <p class="text-red-300 font-bold text-lg">
            {{ getPlayerName(mostVoted) }}
          </p>
          <p class="text-sm text-red-400">was voted as the impostor!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameState } from "../composables/use-game-state.js";
import { usePlayerHelpers } from "../composables/use-player-helpers.js";

const { votes, mostVoted } = useGameState();
const { getPlayerName } = usePlayerHelpers();
</script>
