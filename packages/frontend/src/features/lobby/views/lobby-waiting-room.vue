<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-4xl font-bold text-center mb-8 text-blue-400">Impostor</h1>

    <div class="mb-6">
      <input
        v-model="playerName"
        type="text"
        placeholder="Your name"
        class="w-full px-4 py-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="lobbyStore.setPlayerName(playerName)"
      />
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4 text-white">Create Game</h2>
        <CreateGameForm />
      </div>

      <div class="bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4 text-white">Join Game</h2>
        <JoinGameForm />
      </div>
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

const lobbyStore = useLobbyStore();
const playerName = ref<string>(lobbyStore.playerName);

watch(playerName, (newName) => {
  lobbyStore.setPlayerName(newName);
});
</script>
