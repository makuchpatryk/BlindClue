export class PlayerId {
  constructor(readonly value: string) {
    if (!value) throw new Error('PlayerId cannot be empty');
  }

  static generate(): PlayerId {
    return new PlayerId(`player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
}
