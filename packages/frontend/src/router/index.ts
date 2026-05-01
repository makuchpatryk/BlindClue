import { createRouter, createWebHistory } from "vue-router";
import LobbyWaitingRoom from "@/features/lobby/views/lobby-waiting-room.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: LobbyWaitingRoom,
  },
  {
    path: "/:gameId",
    name: "game",
    component: () => import("../features/game/views/game-view.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
