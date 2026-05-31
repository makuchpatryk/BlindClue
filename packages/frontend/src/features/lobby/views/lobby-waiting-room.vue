<template>
  <div class="max-w-2xl mx-auto p-6">
    <AvatarSelectorModal
      :show="showAvatarModal"
      v-model="selectedAvatar"
      @close="showAvatarModal = false"
    />
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-300 mb-2"
          >Your Name</label
        >
        <Input
          v-model="playerName"
          type="text"
          placeholder="Your name"
          @change="lobbyStore.setPlayerName(playerName)"
        />
      </div>
      <Button
        type="button"
        @click="showAvatarModal = true"
        variant="secondary"
        full-width
        class="flex items-center justify-center gap-2"
      >
        <AvatarBadge :avatar="selectedAvatar" size="small" />
        <span class="hidden sm:inline">Avatar</span>
      </Button>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <Card>
        <template #header>
          <Heading :level="2" class="mb-0">Create Game</Heading>
        </template>
        <CreateGameForm />
      </Card>

      <Card>
        <template #header>
          <Heading :level="2" class="mb-0">Join Game</Heading>
        </template>
        <JoinGameForm />
      </Card>
    </div>

    <div class="mt-8 text-center text-gray-400">
      <p>A multiplayer word-guessing game for 2-4 players</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useLobbyStore } from "../stores/lobby.store.js";
import CreateGameForm from "../components/create-game-form.vue";
import JoinGameForm from "../components/join-game-form.vue";
import Input from "@/shared/components/input.vue";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";
import Button from "@/shared/components/button.vue";
import AvatarBadge from "@/shared/components/avatar-badge.vue";
import AvatarSelectorModal from "@/shared/components/avatar-selector-modal.vue";

const lobbyStore = useLobbyStore();
const playerName = ref<string>(lobbyStore.playerName);
const selectedAvatar = ref<string>(lobbyStore.playerAvatar);
const showAvatarModal = ref(false);

watch(playerName, (newName) => {
  lobbyStore.setPlayerName(newName);
});

watch(selectedAvatar, (newAvatar) => {
  lobbyStore.setPlayerAvatar(newAvatar);
});
</script>
