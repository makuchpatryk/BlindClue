<template>
  <div class="p-4 bg-blue-900 rounded-lg text-center">
    <p class="text-sm text-gray-400 mb-2">Game Code</p>
    <p class="text-3xl font-bold text-blue-300 font-mono">{{ code }}</p>
    <button
      class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      @click="copyToClipboard"
    >
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  code: string;
}

const props = defineProps<Props>();

const copied = ref(false);

function copyToClipboard() {
  navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
