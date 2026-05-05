import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router/index.js";
import App from "./App.vue";
import { getSocket } from "./shared/utils/socket.js";
import { GameClientService } from "./features/game/services/game-client.service.js";
import { useGameStore } from "./features/game/stores/game.store.js";
import "./shared/styles/index.css";

const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia);

// Initialize router
app.use(router);

// Initialize Socket.io and GameClientService
const socket = getSocket();
const gameStore = useGameStore();
const gameClientService = GameClientService.getInstance(socket, gameStore);
app.provide("gameClientService", gameClientService);

app.mount("#app");
