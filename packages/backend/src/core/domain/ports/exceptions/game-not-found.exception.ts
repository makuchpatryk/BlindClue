import { DomainException } from "./domain.exception.js";

export class GameNotFoundException extends DomainException {
  constructor(gameId: string) {
    super("GAME_NOT_FOUND", `Game ${gameId} not found`);
    this.name = "GameNotFoundException";
  }
}
