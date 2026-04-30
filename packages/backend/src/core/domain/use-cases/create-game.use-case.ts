import { Game } from '../entities/game.js';
import { Result, ResultError } from '../../../application/utils/result.js';
import { IWordRepository } from '../ports/word.repository.js';

export class CreateGameUseCase {
  constructor(private wordRepository: IWordRepository) {}

  async execute(): Promise<Result<{ gameId: string; wordId: string; categoryId: string }, ResultError>> {
    const wordResult = await this.wordRepository.getRandomWord();
    if (!wordResult.ok) {
      return wordResult;
    }

    const word = wordResult.value;
    const gameId = Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    const game = new Game(gameId, word.getId(), word.getCategoryId());

    return {
      ok: true,
      value: {
        gameId: game.getId(),
        wordId: game.getWordId(),
        categoryId: game.getCategoryId(),
      },
    };
  }
}
