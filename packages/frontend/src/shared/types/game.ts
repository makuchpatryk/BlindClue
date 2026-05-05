import type { useGameStore } from "@/features/game/stores/game.store.js";

export enum JoinStatus {
  IDLE = "idle",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type GameStore = ReturnType<typeof useGameStore>;

export interface PlayerDTO {
  id: string;
  name: string;
}

export interface DescriptionDTO {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  round: number;
}
