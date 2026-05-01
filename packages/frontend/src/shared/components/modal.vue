<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
      <h2 class="text-xl font-bold mb-4 text-white">{{ title }}</h2>
      <slot />
      <div class="mt-6 flex gap-2 justify-end">
        <Button variant="secondary" @click="$emit('close')"> Close </Button>
        <Button v-if="confirmText" @click="$emit('confirm')">
          {{ confirmText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "./button.vue";

interface Props {
  isOpen: boolean;
  title: string;
  confirmText?: string;
}

defineProps<Props>();

defineEmits<{
  close: [];
  confirm: [];
}>();
</script>
