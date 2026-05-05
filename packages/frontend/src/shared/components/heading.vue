<template>
  <component :is="tag" :class="[baseClasses, variantClasses, $attrs.class]">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  level?: 2 | 3;
  variant?: "primary" | "secondary" | "tertiary";
}

const props = withDefaults(defineProps<Props>(), {
  level: 2,
  variant: "primary",
});

const tag = computed(() => `h${props.level}`);

const baseClasses = computed(() => {
  switch (props.level) {
    case 3:
      return "font-bold text-white";
    case 2:
    default:
      return "font-bold text-white";
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case "secondary":
      if (props.level === 3) {
        return "text-lg font-semibold text-gray-300 mb-2";
      }
      return "text-xl text-gray-300 mb-4";
    case "tertiary":
      return "text-lg text-gray-400 mb-2";
    case "primary":
    default:
      if (props.level === 3) {
        return "text-xl mb-4";
      }
      return "text-2xl mb-6";
  }
});
</script>
