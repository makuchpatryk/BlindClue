<template>
  <div class="avatar-selector">
    <label v-if="label" class="block text-sm font-medium text-gray-300 mb-2">
      {{ label }}
    </label>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="avatar in AVATAR_STYLES"
        :key="avatar"
        type="button"
        @click="selectAvatar(avatar)"
        class="avatar-option group relative"
        :class="{
          'ring-2 ring-blue-400': modelValue === avatar,
        }"
      >
        <img
          :src="getAvatarUrl(avatar)"
          :alt="avatar"
          class="w-full h-full rounded-lg object-cover transition-transform group-hover:scale-105"
        />
        <div
          v-if="modelValue === avatar"
          class="absolute inset-0 rounded-lg bg-blue-500 opacity-10 pointer-events-none"
        ></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AVATAR_STYLES,
  getAvatarUrl,
  type AvatarStyle,
} from "@/shared/utils/avatar-config.js";

defineProps<{
  modelValue?: string;
  label?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectAvatar = (avatar: AvatarStyle) => {
  emit("update:modelValue", avatar);
};
</script>

<style scoped>
.avatar-option {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  border-color: rgb(96, 165, 250);
}
</style>
