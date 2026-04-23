import { createRouter, createWebHistory } from 'vue-router';
import LobbyWaitingRoom from '../features/lobby/components/lobby-waiting-room.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: LobbyWaitingRoom,
  },
  {
    path: '/game/:gameId',
    name: 'game',
    component: () => import('../features/game/components/game-view.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
