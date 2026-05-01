import { ref } from "vue";
import { API_BASE_URL } from "@/shared/utils/constants.js";

export function useAdminService() {
  const categories = ref<Array<{ id: string; name: string }>>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function getCategories() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      categories.value = data;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCategory(name: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error("Failed to create category");
      await getCategories();
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  async function addWord(categoryId: string, word: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, word }),
      });

      if (!response.ok) throw new Error("Failed to add word");
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
  }

  return {
    categories,
    isLoading,
    error,
    getCategories,
    createCategory,
    addWord,
  };
}
