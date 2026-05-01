<template>
  <div class="p-4 bg-blue-900 rounded-lg text-center">
    <p class="text-sm text-gray-400 mb-2">Game Code</p>
    <p class="text-3xl font-bold text-blue-300 font-mono">{{ code }}</p>
    <Button class="mt-2 text-sm px-3 py-1" @click="copyToClipboard">
      {{ copied ? "Copied!" : "Copy" }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "../composables/use-clipboard.js";
import Button from "./button.vue";

interface Props {
  code: string;
}

const props = defineProps<Props>();
const { copied, copyToClipboard: copy } = useClipboard();

function copyToClipboard() {
  copy(props.code);
}
</script>
