<template>
  <div
    v-if="show"
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-40"
  >
    ✓ Game ID copied to clipboard
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
}

withDefaults(defineProps<Props>(), {});
</script>
