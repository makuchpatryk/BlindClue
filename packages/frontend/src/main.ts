import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router/index.js';
import App from './App.vue';
import { getSocket } from './features/shared/utils/socket.js';
import { GameClientService } from './features/shared/services/game-client.service.js';
import './features/shared/styles/index.css';

const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia);

// Initialize router
app.use(router);

// Initialize Socket.io and GameClientService
const socket = getSocket();
const gameClientService = GameClientService.getInstance(socket);
app.provide('gameClientService', gameClientService);

app.mount('#app');
