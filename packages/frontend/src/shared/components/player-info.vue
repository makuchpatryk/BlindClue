<template>
  <div class="p-4 bg-gray-600 rounded">
    <p class="font-semibold text-gray-200">{{ playerName }}</p>
    <p class="text-gray-300 mt-2">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  playerName: string;
  text?: string;
}

defineProps<Props>();
</script>
