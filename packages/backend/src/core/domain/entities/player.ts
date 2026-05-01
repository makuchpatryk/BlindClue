import { PlayerId } from "../value-objects/player-id.js";

export class Player {
  private isImpostor: boolean = false;

  constructor(
    private id: PlayerId,
    private gameId: string,
    private name: string,
  ) {}

  getId(): PlayerId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getGameId(): string {
    return this.gameId;
  }

  isTheImpostor(): boolean {
    return this.isImpostor;
  }

  setImpostor(): void {
    this.isImpostor = true;
  }
}
