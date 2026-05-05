<template>
  <input
    :type="type"
    :class="[baseClasses, $attrs.class]"
    :placeholder="placeholder"
    :value="modelValue"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: string | number;
  type?: "text" | "number" | "password" | "email";
  placeholder?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  modelValue: "",
  fullWidth: true,
});

defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const baseClasses = computed(() => {
  const classes =
    "px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400";
  return props.fullWidth ? `${classes} w-full` : classes;
});
</script>
