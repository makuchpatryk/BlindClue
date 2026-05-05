<template>
  <Card>
    <template #header>
      <Heading :level="3">Submit Your Description</Heading>
    </template>
    <form @submit.prevent="submit" class="space-y-4">
      <textarea
        v-model="description"
        class="w-full px-4 py-2 border border-gray-600 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Describe the word without saying it directly..."
        rows="4"
        :disabled="isSubmitting"
      />
      <Button type="submit" full-width :disabled="!description || isSubmitting">
        {{ isSubmitting ? "Submitting..." : "Submit Description" }}
      </Button>
    </form>
  </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameFacade } from "../composables/use-game-facade.js";
import Button from "@/shared/components/button.vue";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";

const { submitDescription } = useGameFacade();
const description = ref("");
const isSubmitting = ref(false);

async function submit() {
  if (!description.value.trim()) return;

  isSubmitting.value = true;
  try {
    submitDescription(description.value);
    description.value = "";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
