<template>
  <Card>
    <template #header>
      <div class="flex justify-between items-center">
        <Heading :level="2" class="mb-0">
          Round {{ currentRound }}/{{ numberOfRounds }}
        </Heading>
        <p class="text-lg font-semibold text-blue-400">
          Category: {{ category }}
        </p>
      </div>
    </template>

    <Alert v-if="!isImpostor" variant="info" class="mb-6">
      You know the word. Give a description!
    </Alert>
    <Alert v-else variant="error" class="mb-6">
      You are the Impostor. Listen and figure out the word.
    </Alert>

    <div class="space-y-4">
      <h3 class="font-semibold text-gray-300">Players in this round:</h3>
      <ul class="space-y-2">
        <li
          v-for="player in players"
          :key="player.id"
          class="flex items-center p-2 bg-gray-600 rounded text-gray-200"
        >
          <span class="font-medium">{{ player.name }}</span>
          <span
            v-if="player.id === impostorId"
            class="ml-auto px-2 py-1 bg-red-900 text-red-300 rounded text-sm"
          >
            Impostor?
          </span>
        </li>
      </ul>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameFacade } from "../../composables/use-game-facade.js";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";
import Alert from "@/shared/components/alert.vue";

const { gameStore } = useGameFacade();

const currentRound = computed(() => gameStore.currentRound);
const numberOfRounds = computed(() => gameStore.numberOfRounds);
const category = computed(() => gameStore.category);
const isImpostor = computed(() => gameStore.isImpostor);
const players = computed(() => gameStore.players);
const impostorId = computed(() => gameStore.impostorId);
</script>
