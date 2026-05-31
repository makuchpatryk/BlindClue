<template>
  <div class="p-4 bg-gray-600 rounded">
    <div class="flex items-center gap-2 mb-2">
      <AvatarBadge :avatar="avatar" size="small" />
      <p class="font-semibold text-gray-200">{{ playerName }}</p>
    </div>
    <p class="text-gray-300 mt-2">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import AvatarBadge from "./avatar-badge.vue";

interface Props {
  playerName: string;
  text?: string;
  avatar?: string;
}

defineProps<Props>();
</script>
