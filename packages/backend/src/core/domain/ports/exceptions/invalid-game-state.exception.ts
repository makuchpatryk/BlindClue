import { DomainException } from "./domain.exception.js";

export class InvalidGameStateException extends DomainException {
  constructor(message: string) {
    super("INVALID_GAME_STATE", message);
    this.name = "InvalidGameStateException";
  }
}
