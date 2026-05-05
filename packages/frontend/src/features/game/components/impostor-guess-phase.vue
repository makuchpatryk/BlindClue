<template>
  <Card>
    <template #header>
      <Heading :level="3">Impostor's Turn to Guess</Heading>
    </template>
    <p class="text-gray-400 mb-6">
      Impostor, what do you think the word is? (One chance)
    </p>

    <form v-if="!hasGuessed" @submit.prevent="submit" class="space-y-4">
      <Input
        v-model="guess"
        type="text"
        placeholder="Enter your guess..."
        :disabled="isGuessing"
      />
      <Button type="submit" full-width :disabled="!guess || isGuessing">
        {{ isGuessing ? "Submitting..." : "Submit Guess" }}
      </Button>
    </form>

    <Alert v-else variant="info"> Guess submitted! </Alert>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameFacade } from "../composables/use-game-facade.js";
import Button from "@/shared/components/button.vue";
import Card from "@/shared/components/card.vue";
import Heading from "@/shared/components/heading.vue";
import Input from "@/shared/components/input.vue";
import Alert from "@/shared/components/alert.vue";

const { gameStore, guessWord } = useGameFacade();
const guess = ref("");
const isGuessing = ref(false);
const hasGuessed = ref(false);
const isCorrect = ref(false);
const actualWord = computed(() => gameStore.word || "");

async function submit() {
  if (!guess.value.trim()) return;

  isGuessing.value = true;
  try {
    const userGuess = guess.value.toLowerCase().trim();
    const correct = userGuess === (gameStore.word || "").toLowerCase();

    isCorrect.value = correct;
    hasGuessed.value = true;

    guessWord(userGuess);
  } finally {
    isGuessing.value = false;
  }
}
</script>
