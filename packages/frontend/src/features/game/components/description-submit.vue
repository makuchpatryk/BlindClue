<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold mb-4">Submit Your Description</h3>
    <form @submit.prevent="submit" class="space-y-4">
      <textarea
        v-model="description"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Describe the word without saying it directly..."
        rows="4"
        :disabled="isSubmitting"
      />
      <button
        type="submit"
        :disabled="!description || isSubmitting"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Description' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameState } from '../composables/use-game-state.js';

const { submitDescription } = useGameState();
const description = ref('');
const isSubmitting = ref(false);

async function submit() {
  if (!description.value.trim()) return;

  isSubmitting.value = true;
  try {
    submitDescription(description.value);
    description.value = '';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
