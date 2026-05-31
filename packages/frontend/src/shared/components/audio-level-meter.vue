<template>
  <div
    class="flex items-center gap-1"
    :title="`Audio level: ${(level * 100).toFixed(0)}%`"
  >
    <div class="flex gap-0.5">
      <div
        v-for="i in 5"
        :key="i"
        class="h-2 w-1 transition-colors"
        :class="getBarColor(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  level: number;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
});

const level = ref(props.level);

function getBarColor(barIndex: number): string {
  const threshold = (barIndex / 5) * 0.8;
  if (level.value > threshold) {
    if (level.value > 0.6) {
      return "bg-green-500";
    } else if (level.value > 0.3) {
      return "bg-yellow-500";
    } else {
      return "bg-red-500";
    }
  }
  return "bg-gray-500";
}
</script>
