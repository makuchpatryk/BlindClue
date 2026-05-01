<template>
  <button :class="[baseClasses, variantClasses]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
});

const baseClasses =
  "px-4 py-2 text-white rounded disabled:opacity-50 transition";

const variantClasses = computed(() => {
  switch (props.variant) {
    case "secondary":
      return "bg-gray-600 hover:bg-gray-700";
    case "danger":
      return "bg-red-600 hover:bg-red-700";
    case "primary":
    default:
      return "bg-blue-600 hover:bg-blue-700";
  }
});
</script>
