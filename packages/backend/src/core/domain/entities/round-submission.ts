import { PlayerId } from "../value-objects/player-id.js";

export class RoundSubmission {
  constructor(
    private id: string,
    private gameId: string,
    private round: number,
    private playerId: PlayerId,
    private description: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getGameId(): string {
    return this.gameId;
  }

  getRound(): number {
    return this.round;
  }

  getPlayerId(): PlayerId {
    return this.playerId;
  }

  getDescription(): string {
    return this.description;
  }
}
