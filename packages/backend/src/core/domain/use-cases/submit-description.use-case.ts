import { Game } from '../entities/game.js';
import { Result, ResultError } from '../../../application/utils/result.js';

export class SubmitDescriptionUseCase {
  async execute(game: Game, playerId: string, description: string): Promise<Result<void, ResultError>> {
    return game.submitDescription(playerId, description);
  }
}
