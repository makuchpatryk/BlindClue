export class IdGenerator {
  static gameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static playerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static submissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static categoryId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static wordId(): string {
    return `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
