<template>
  <div class="space-y-4">
    <div
      v-if="isImpostor"
      class="bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-4"
    >
      <p class="text-red-200 font-bold text-center text-lg">
        🎭 YOU ARE THE IMPOSTOR
      </p>
    </div>

    <div class="bg-gray-700 rounded-lg shadow p-6">
      <div class="text-center">
        <h3 class="text-sm font-semibold text-gray-400 mb-2">
          ROUND {{ currentRound }}/{{ numberOfRounds }}
        </h3>
        <h2 class="text-3xl font-bold text-white mb-4">
          It's {{ currentPlayer?.name }}'s turn
        </h2>
        <div class="bg-gray-800 rounded p-4 mb-6 space-y-3">
          <p class="text-gray-300 text-lg">
            Category:
            <span class="text-yellow-400 font-bold">{{
              isImpostor ? category : "???"
            }}</span>
          </p>
          <p v-if="!isImpostor && word" class="text-gray-300 text-lg">
            Word to guess:
            <span class="text-green-400 font-bold">{{ word }}</span>
          </p>
        </div>

        <div
          v-if="
            currentRound < numberOfRounds ||
            playersClickedThisRound.size < players.length
          "
          class="space-y-4"
        >
          <div v-if="isMyTurn" class="bg-gray-600 rounded-lg p-4">
            <label class="block text-gray-300 mb-2">Write a word:</label>
            <input
              v-model="playerWordInput"
              type="text"
              placeholder="Enter your word..."
              autofocus
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
          </div>
          <Button
            full-width
            @click="handleNextPerson"
            :disabled="!isMyTurn || !playerWordInput.trim()"
          >
            <span v-if="isMyTurn">Next Person</span>
            <span v-else>Waiting for {{ currentPlayer?.name }}...</span>
          </Button>
        </div>

        <div v-else class="space-y-4">
          <p class="text-lg text-gray-300 mb-4">
            All rounds complete! Who is the impostor?
          </p>
          <PlayerSelectionList />
          <Button
            variant="success"
            full-width
            @click="handleShowImpostor"
            :disabled="!selectedImpostorGuess"
          >
            {{
              selectedImpostorGuess
                ? "Show Impostor"
                : "Select a player first"
            }}
          </Button>
        </div>

        <div
          v-if="playerWords.size > 0"
          class="bg-gray-600 rounded-lg p-4 mt-6"
        >
          <h3 class="text-gray-300 font-semibold mb-3">Words Submitted:</h3>
          <div class="space-y-2">
            <div v-for="p in players" :key="p.id">
              <span v-if="hasPlayerWord(p.id)" class="text-gray-200">
                <span class="font-semibold">{{ p.name }}:</span>
                <span class="text-gray-300 ml-2">{{
                  playerWords.get(p.id)?.join(", ")
                }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useGameStore } from "../stores/game.store.js";
import Button from "@/shared/components/button.vue";
import PlayerSelectionList from "./player-selection-list.vue";

const gameStore = useGameStore();
const playerWordInput = ref<string>("");

const emit = defineEmits<{
  nextPerson: [word: string];
  showImpostor: [];
}>();

const currentRound = computed(() => gameStore.currentRound);
const numberOfRounds = computed(() => gameStore.numberOfRounds);
const category = computed(() => gameStore.category);
const word = computed(() => gameStore.word);
const isImpostor = computed(() => gameStore.isImpostor);
const players = computed(() => gameStore.players);
const currentPlayer = computed(() => gameStore.currentPlayer);
const isMyTurn = computed(() => currentPlayer.value?.id === gameStore.myPlayerId);
const selectedImpostorGuess = computed(() => gameStore.selectedImpostorGuess);
const playerWords = computed(() => gameStore.playerWords);
const playersClickedThisRound = computed(() => gameStore.playersClickedThisRound);

function hasPlayerWord(id: string) {
  return playerWords.value.has(id);
}

function handleNextPerson() {
  if (!isMyTurn.value || !playerWordInput.value.trim()) return;
  emit("nextPerson", playerWordInput.value);
  playerWordInput.value = "";
}

function handleShowImpostor() {
  emit("showImpostor");
}
</script>
