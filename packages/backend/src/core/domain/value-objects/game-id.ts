export class GameId {
  constructor(readonly value: string) {
    if (!value) throw new Error('GameId cannot be empty');
  }

  static generate(): GameId {
    return new GameId(`game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
}
