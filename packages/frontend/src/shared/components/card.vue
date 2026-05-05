<template>
  <div class="bg-gray-700 rounded-lg shadow p-6" :class="$attrs.class">
    <template v-if="$slots.header">
      <div class="mb-4">
        <slot name="header" />
      </div>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
// Card component - wrapper for consistent card styling
</script>
