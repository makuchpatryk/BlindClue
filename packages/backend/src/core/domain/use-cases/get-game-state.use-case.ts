import { Game } from "../entities/game.js";

export interface GameStateDTO {
  id: string;
  status: string;
  currentRound: number;
  numberOfRounds: number;
  categoryId: string;
  impostorId: string | null;
  players: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}

export class GetGameStateUseCase {
  execute(game: Game): GameStateDTO {
    return {
      id: game.getId(),
      status: game.getStatus(),
      currentRound: game.getCurrentRound(),
      numberOfRounds: game.getNumberOfRounds(),
      categoryId: game.getCategoryId(),
      impostorId: game.getImpostorId(),
      players: game.getPlayers().map((p) => ({
        id: p.getId().value,
        name: p.getName(),
        score: p.getScore(),
      })),
    };
  }
}
