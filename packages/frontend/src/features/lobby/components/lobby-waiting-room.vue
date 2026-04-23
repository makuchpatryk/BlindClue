<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-4xl font-bold text-center mb-8">Impostor</h1>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Create Game</h2>
        <CreateGameForm />
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Join Game</h2>
        <JoinGameForm />
      </div>
    </div>

    <div class="mt-8 text-center text-gray-600">
      <p>A multiplayer word-guessing game for 2-4 players</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateGameForm from './create-game-form.vue';
import JoinGameForm from './join-game-form.vue';
</script>
