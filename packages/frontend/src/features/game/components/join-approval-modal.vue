<template>
  <div
    v-if="show && pendingRequest"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <Card class="max-w-sm w-full">
      <template #header>
        <Heading :level="2" class="mb-0">Join Request</Heading>
      </template>
      <p class="text-lg mb-6 text-gray-300">
        {{ pendingRequest.playerName }} wants to join
      </p>
      <div class="flex gap-3">
        <Button variant="success" class="flex-1" @click="approveRequest">
          Allow
        </Button>
        <Button variant="danger" class="flex-1" @click="rejectRequest">
          Deny
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "@/shared/components/button.vue";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";

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
