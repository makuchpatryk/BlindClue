<template>
  <div
    v-if="show && pendingRequest"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-8 max-w-sm w-full">
      <h2 class="text-2xl font-bold mb-4 text-white">Join Request</h2>
      <p class="text-lg mb-6 text-gray-300">
        {{ pendingRequest.playerName }} wants to join
      </p>
      <div class="flex gap-3">
        <Button
          variant="success"
          class="flex-1"
          @click="approveRequest"
        >
          Allow
        </Button>
        <Button
          variant="danger"
          class="flex-1"
          @click="rejectRequest"
        >
          Deny
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "@/shared/components/button.vue";

interface PendingRequest {
  requestId: string;
  playerName: string;
}

interface Props {
  show: boolean;
  pendingRequest: PendingRequest | null;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  approve: [requestId: string];
  reject: [requestId: string];
}>();

const pendingRequest = computed(() => props.pendingRequest);

function approveRequest() {
  if (pendingRequest.value) {
    emit("approve", pendingRequest.value.requestId);
  }
}

function rejectRequest() {
  if (pendingRequest.value) {
    emit("reject", pendingRequest.value.requestId);
  }
}
</script>
