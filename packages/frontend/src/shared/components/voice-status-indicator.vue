<template>
  <div
    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
    :class="statusClasses"
    :title="statusLabel"
  >
    <span class="text-xs">{{ statusIcon }}</span>
    <span class="text-xs">{{ displayName }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  displayName: string;
  connectionState?: RTCPeerConnectionState | "local";
}

const props = withDefaults(defineProps<Props>(), {
  connectionState: "local",
});

const statusIcon = computed(() => {
  switch (props.connectionState) {
    case "connected":
      return "🟢";
    case "connecting":
      return "🟡";
    case "disconnected":
    case "failed":
      return "🔴";
    case "closed":
      return "⚫";
    case "local":
      return "🎤";
    default:
      return "❓";
  }
});

const statusLabel = computed(() => {
  switch (props.connectionState) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "disconnected":
      return "Disconnected";
    case "failed":
      return "Failed";
    case "closed":
      return "Closed";
    case "local":
      return "You (Local)";
    default:
      return "Unknown";
  }
});

const statusClasses = computed(() => {
  switch (props.connectionState) {
    case "connected":
      return "bg-green-900 text-green-200";
    case "connecting":
      return "bg-yellow-900 text-yellow-200";
    case "disconnected":
    case "failed":
      return "bg-red-900 text-red-200";
    case "closed":
      return "bg-gray-700 text-gray-300";
    case "local":
      return "bg-blue-900 text-blue-200";
    default:
      return "bg-gray-700 text-gray-300";
  }
});
</script>
