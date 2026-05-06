<template>
  <GameOrchestrator :game-id="gameId" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import GameOrchestrator from "../components/game-orchestrator.vue";

const route = useRoute();
const gameId = route.params.gameId as string;
</script>
