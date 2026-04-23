import { PlayerId } from '../value-objects/player-id.js';

export class Vote {
  constructor(
    private id: string,
    private gameId: string,
    private voterId: PlayerId,
    private votedForId: PlayerId
  ) {}

  getId(): string {
    return this.id;
  }

  getGameId(): string {
    return this.gameId;
  }

  getVoterId(): PlayerId {
    return this.voterId;
  }

  getVotedForId(): PlayerId {
    return this.votedForId;
  }
}
