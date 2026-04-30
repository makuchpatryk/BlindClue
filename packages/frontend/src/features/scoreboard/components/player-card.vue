<template>
  <div class="bg-gray-700 rounded-lg shadow p-6 text-center">
    <div class="text-4xl font-bold text-blue-400 mb-2">{{ score }}</div>
    <p class="font-semibold text-gray-200">{{ playerName }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  playerName: string;
  score: number;
}

defineProps<Props>();
</script>
