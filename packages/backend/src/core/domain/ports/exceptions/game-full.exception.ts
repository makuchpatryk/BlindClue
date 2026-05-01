import { DomainException } from "./domain.exception.js";

export class GameFullException extends DomainException {
  constructor() {
    super("GAME_FULL", "Game is full");
    this.name = "GameFullException";
  }
}
