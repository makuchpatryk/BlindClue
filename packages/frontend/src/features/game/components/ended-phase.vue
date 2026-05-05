<template>
  <div class="space-y-4">
    <Heading :level="2">Game Over</Heading>

    <div class="space-y-4">
      <InfoBox title="Most Voted" value-color="yellow-400">
        <span>{{ getMostVotedName() }}</span>
        <span class="text-gray-400 ml-2"
          >({{ getMostVotedCount() }} votes)</span
        >
      </InfoBox>

      <InfoBox title="The Impostor Was" value-color="red-400">
        {{ getImpostorName() }}
      </InfoBox>

      <InfoBox title="The Word Was" value-color="green-400">
        {{ word }}
      </InfoBox>

      <Card>
        <template #header>
          <Heading :level="3" variant="secondary">Vote Results</Heading>
        </template>
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
      </Card>

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
import Heading from "@/shared/components/heading.vue";
import InfoBox from "@/shared/components/info-box.vue";
import Card from "@/shared/components/card.vue";

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
