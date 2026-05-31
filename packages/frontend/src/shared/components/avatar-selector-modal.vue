<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <Card class="max-w-2xl w-full mx-4">
      <template #header>
        <Heading :level="2">Choose Your Avatar</Heading>
      </template>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="avatar in AVATAR_STYLES"
          :key="avatar"
          type="button"
          @click="selectAndClose(avatar)"
          class="avatar-option group relative aspect-square"
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
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AVATAR_STYLES, getAvatarUrl, type AvatarStyle } from "@/shared/utils/avatar-config.js";
import Card from "./card.vue";
import Heading from "./heading.vue";

defineProps<{
  show: boolean;
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  close: [];
}>();

const selectAndClose = (avatar: AvatarStyle) => {
  emit("update:modelValue", avatar);
  emit("close");
};
</script>

<style scoped>
.avatar-option {
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  border-color: rgb(96, 165, 250);
}
</style>
