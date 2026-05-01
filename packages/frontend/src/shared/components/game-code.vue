<template>
  <div class="p-4 bg-blue-900 rounded-lg text-center">
    <p class="text-sm text-gray-400 mb-2">Game Code</p>
    <p class="text-3xl font-bold text-blue-300 font-mono">{{ code }}</p>
    <button
      class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      @click="copyToClipboard"
    >
      {{ copied ? "Copied!" : "Copy" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "../composables/use-clipboard.js";

interface Props {
  code: string;
}

const props = defineProps<Props>();
const { copied, copyToClipboard: copy } = useClipboard();

function copyToClipboard() {
  copy(props.code);
}
</script>
