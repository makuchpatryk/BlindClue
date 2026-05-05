<template>
  <div class="bg-white rounded-lg shadow p-6">
    <Heading :level="2" class="text-gray-900">Manage Words</Heading>

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

      <Button
        type="submit"
        full-width
        :disabled="!newWord || !selectedCategoryId || isAdding"
      >
        {{ isAdding ? "Adding..." : "Add Word" }}
      </Button>
    </form>

    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminService } from "../composables/use-admin-service.js";
import Button from "@/shared/components/button.vue";
import Heading from "@/shared/components/heading.vue";

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
