<template>
  <div>
    <label class="block text-sm font-medium text-gray-300 mb-2">
      {{ label }}
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>
