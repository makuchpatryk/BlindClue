import { Game } from '../entities/game.js';
import { Result, ResultError } from '../../../application/utils/result.js';

export class GuessWordUseCase {
  async execute(game: Game, guess: string, word: string): Promise<Result<boolean, ResultError>> {
    return game.guessWord(guess, word);
  }
}
