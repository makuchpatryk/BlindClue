<template>
  <div class="avatar-badge" :class="sizeClasses">
    <img
      v-if="avatar && isValidAvatarId(avatar)"
      :src="getAvatarUrl(avatar as any)"
      :alt="avatar"
      class="w-full h-full rounded-full object-cover"
    />
    <div v-else class="w-full h-full rounded-full bg-gray-600 flex items-center justify-center">
      <span class="text-xs font-semibold text-white">?</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getAvatarUrl, isValidAvatarId } from "@/shared/utils/avatar-config.js";

interface Props {
  avatar?: string;
  size?: "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  size: "small",
});

const sizeClasses = computed(() => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };
  return sizes[props.size];
});
</script>

<style scoped>
.avatar-badge {
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(75, 85, 99, 0.5);
}
</style>
