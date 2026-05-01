export interface GameStateDTO {
  id: string;
  status: "LOBBY" | "RUNNING" | "VOTING" | "ENDED";
  currentRound: number;
  numberOfRounds: number;
  categoryId: string;
  impostorId?: string;
  players: PlayerDTO[];
}

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
