<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6">Manage Categories</h2>

    <form @submit.prevent="addCategory" class="mb-6 space-y-4">
      <input
        v-model="newCategory"
        type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter category name"
      />
      <button
        type="submit"
        :disabled="!newCategory || isAdding"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isAdding ? 'Adding...' : 'Add Category' }}
      </button>
    </form>

    <div v-if="isLoading" class="text-center text-gray-500">Loading categories...</div>
    <div v-else class="space-y-2">
      <div v-for="category in categories" :key="category.id" class="p-3 bg-gray-50 rounded flex justify-between items-center">
        <span class="font-medium">{{ category.name }}</span>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminService } from '../composables/use-admin-service.js';

const { categories, isLoading, error, getCategories, createCategory } = useAdminService();
const newCategory = ref('');
const isAdding = ref(false);

onMounted(() => {
  getCategories();
});

async function addCategory() {
  if (!newCategory.value.trim()) return;

  isAdding.value = true;
  try {
    await createCategory(newCategory.value);
    newCategory.value = '';
  } finally {
    isAdding.value = false;
  }
}
</script>
