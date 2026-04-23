import { Game } from '../../core/domain/entities/game.js';

export class GameManager {
  private static instance: GameManager;
  private games: Map<string, Game> = new Map();

  private constructor() {}

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  createGame(gameId: string, game: Game): void {
    this.games.set(gameId, game);
  }

  getGame(gameId: string): Game | null {
    return this.games.get(gameId) ?? null;
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }

  exists(gameId: string): boolean {
    return this.games.has(gameId);
  }
}
