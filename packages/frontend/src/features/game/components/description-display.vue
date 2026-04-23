<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold mb-4">Round {{ round }} Descriptions</h3>
    <div v-if="roundDescriptions.length === 0" class="text-gray-500 text-center py-4">
      Waiting for descriptions...
    </div>
    <div v-else class="space-y-4">
      <div v-for="desc in roundDescriptions" :key="desc.id" class="p-4 bg-gray-50 rounded">
        <p class="font-semibold text-gray-700">{{ desc.playerName }}</p>
        <p class="text-gray-600 mt-2">{{ desc.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameState } from '../composables/use-game-state.js';

interface Props {
  round: number;
}

defineProps<Props>();

const { descriptions } = useGameState();

const roundDescriptions = computed(() => {
  return Array.from(descriptions.value.get(props.round) || []);
});
</script>
