<template>
  <div
    class="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-100"
    :class="containerClass"
    :title="`Audio level: ${(level * 100).toFixed(0)}%`"
  >
    <div class="flex gap-0.5">
      <div
        v-for="i in 10"
        :key="i"
        class="h-3 w-3 rounded-sm transition-all duration-75"
        :style="{ opacity: 0.6 + getBarOpacity(i) * 0.4 }"
        :class="getBarColor(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  level: number;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
});

const containerClass = computed(() => {
  if (props.level > 0.5) {
    return "bg-green-900 border-2 border-green-400 shadow-lg shadow-green-500/50";
  } else if (props.level > 0.2) {
    return "bg-yellow-900 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50";
  }
  return "bg-gray-700 border border-gray-600";
});

function getBarOpacity(barIndex: number): number {
  const threshold = (barIndex / 10) * 0.8;
  return props.level > threshold ? 1 : 0;
}

function getBarColor(barIndex: number): string {
  const threshold = (barIndex / 10) * 0.8;
  if (props.level > threshold) {
    if (props.level > 0.6) {
      return "bg-green-400";
    } else if (props.level > 0.3) {
      return "bg-yellow-400";
    } else {
      return "bg-orange-400";
    }
  }
  return "bg-gray-600";
}
</script>
