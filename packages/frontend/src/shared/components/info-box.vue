<template>
  <div class="bg-gray-700 rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-300 mb-2">
      {{ title }}
    </h3>
    <p class="text-xl text-white">
      <span :class="['font-bold', valueColorClass]">
        <slot>{{ value }}</slot>
      </span>
      <slot name="suffix" />
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  value?: string;
  valueColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  valueColor: "yellow-400",
});

const valueColorClass = computed(() => `text-${props.valueColor}`);
</script>
