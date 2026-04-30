<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
      <h2 class="text-xl font-bold mb-4 text-white">{{ title }}</h2>
      <slot />
      <div class="mt-6 flex gap-2 justify-end">
        <button
          class="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-700"
          @click="$emit('close')"
        >
          Close
        </button>
        <button
          v-if="confirmText"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
