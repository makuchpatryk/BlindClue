export interface GameStateDTO {
  id: string;
  status: 'LOBBY' | 'RUNNING' | 'VOTING' | 'ENDED';
  currentRound: number;
  categoryId: string;
  impostorId?: string;
  players: PlayerDTO[];
}

export interface PlayerDTO {
  id: string;
  name: string;
  score: number;
}

export interface DescriptionDTO {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  round: number;
}

export interface ScoreDTO {
  playerId: string;
  playerName: string;
  score: number;
}
