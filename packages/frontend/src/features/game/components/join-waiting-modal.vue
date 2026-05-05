<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <Card class="max-w-sm w-full">
      <template #header>
        <Heading :level="2" class="mb-0">Waiting for approval...</Heading>
      </template>
      <p class="text-gray-400">The host is reviewing your request to join.</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";

interface Props {
  show: boolean;
}

withDefaults(defineProps<Props>(), {});
</script>
