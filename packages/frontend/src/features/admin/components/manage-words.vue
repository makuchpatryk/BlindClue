<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6">Manage Words</h2>

    <form @submit.prevent="addWord" class="mb-6 space-y-4">
      <select
        v-model="selectedCategoryId"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a category</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>

      <input
        v-model="newWord"
        type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter word"
      />

      <button
        type="submit"
        :disabled="!newWord || !selectedCategoryId || isAdding"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isAdding ? "Adding..." : "Add Word" }}
      </button>
    </form>

    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminService } from "../composables/use-admin-service.js";

const {
  categories,
  error,
  getCategories,
  addWord: addWordService,
} = useAdminService();
const selectedCategoryId = ref("");
const newWord = ref("");
const isAdding = ref(false);

onMounted(() => {
  getCategories();
});

async function addWord() {
  if (!newWord.value.trim() || !selectedCategoryId.value) return;

  isAdding.value = true;
  try {
    await addWordService(selectedCategoryId.value, newWord.value);
    newWord.value = "";
  } finally {
    isAdding.value = false;
  }
}
</script>
