<template>
  <button
    :type="type"
    :class="[baseClasses, variantClasses, $attrs.class]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  noDefaults?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  fullWidth: false,
  type: "button",
  noDefaults: false,
});

const baseClasses = computed(() => {
  if (props.noDefaults) return "";
  const classes =
    "px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition";
  return props.fullWidth ? `${classes} w-full` : classes;
});

const variantClasses = computed(() => {
  if (props.noDefaults) return "";
  switch (props.variant) {
    case "secondary":
      return "bg-gray-600 hover:bg-gray-700";
    case "danger":
      return "bg-red-600 hover:bg-red-700";
    case "success":
      return "bg-green-600 hover:bg-green-700";
    case "primary":
    default:
      return "bg-blue-600 hover:bg-blue-700";
  }
});
</script>
