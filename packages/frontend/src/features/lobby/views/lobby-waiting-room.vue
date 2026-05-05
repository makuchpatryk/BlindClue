<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="mb-6">
      <Input
        v-model="playerName"
        type="text"
        placeholder="Your name"
        @change="lobbyStore.setPlayerName(playerName)"
      />
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

const lobbyStore = useLobbyStore();
const playerName = ref<string>(lobbyStore.playerName);

watch(playerName, (newName) => {
  lobbyStore.setPlayerName(newName);
});
</script>
