<template>
  <Card>
    <template #header>
      <Heading :level="3">Round {{ round }} Descriptions</Heading>
    </template>
    <EmptyState v-if="roundDescriptions.length === 0">
      Waiting for descriptions...
    </EmptyState>
    <div v-else class="space-y-4">
      <PlayerInfo
        v-for="desc in roundDescriptions"
        :key="desc.id"
        :player-name="desc.playerName"
        :text="desc.text"
        :avatar="getPlayerAvatar(desc.playerId)"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameFacade } from "../composables/use-game-facade.js";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";
import EmptyState from "@/shared/components/empty-state.vue";
import PlayerInfo from "@/shared/components/player-info.vue";

interface Props {
  round: number;
}

const props = defineProps<Props>();

const { gameStore } = useGameFacade();

const roundDescriptions = computed(() => {
  return Array.from(gameStore.descriptions.get(props.round) || []);
});

const players = computed(() => gameStore.players);

function getPlayerAvatar(playerId: string): string | undefined {
  return players.value.find((p) => p.id === playerId)?.avatar;
}
</script>
