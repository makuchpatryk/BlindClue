<template>
  <div class="bg-white rounded-lg shadow p-6">
    <Heading :level="2" class="text-gray-900">Manage Categories</Heading>

    <form @submit.prevent="addCategory" class="mb-6 space-y-4">
      <input
        v-model="newCategory"
        type="text"
        class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter category name"
      />
      <Button type="submit" full-width :disabled="!newCategory || isAdding">
        {{ isAdding ? "Adding..." : "Add Category" }}
      </Button>
    </form>

    <div v-if="isLoading" class="text-center text-gray-500">
      Loading categories...
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="category in categories"
        :key="category.id"
        class="p-3 bg-gray-50 rounded flex justify-between items-center"
      >
        <span class="font-medium">{{ category.name }}</span>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminService } from "../composables/use-admin-service.js";
import Button from "@/shared/components/button.vue";
import Heading from "@/shared/components/heading.vue";

const { categories, isLoading, error, getCategories, createCategory } =
  useAdminService();
const newCategory = ref("");
const isAdding = ref(false);

onMounted(() => {
  getCategories();
});

async function addCategory() {
  if (!newCategory.value.trim()) return;

  isAdding.value = true;
  try {
    await createCategory(newCategory.value);
    newCategory.value = "";
  } finally {
    isAdding.value = false;
  }
}
</script>
