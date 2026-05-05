<template>
  <div :class="[baseClasses, variantClasses]">
    <p :class="textColorClass">
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "info" | "success" | "error" | "warning";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "info",
});

const baseClasses = "p-4 rounded border";

const variantClasses = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-green-900 border-green-600";
    case "error":
      return "bg-red-900 border-red-600";
    case "warning":
      return "bg-yellow-900 border-yellow-600";
    case "info":
    default:
      return "bg-blue-900 border-blue-600";
  }
});

const textColorClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "text-green-400 font-bold text-lg";
    case "error":
      return "text-red-400 font-bold text-lg";
    case "warning":
      return "text-yellow-400 font-bold text-lg";
    case "info":
    default:
      return "text-blue-400 font-bold text-lg";
  }
});
</script>
