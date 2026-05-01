<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
      <h2 class="text-2xl font-bold mb-4 text-white">
        Waiting for approval...
      </h2>
      <p class="text-gray-400">The host is reviewing your request to join.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
}

withDefaults(defineProps<Props>(), {});
</script>
