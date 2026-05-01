import { Game } from "../entities/game.js";
import { Result, ResultError } from "../../../application/utils/result.js";

export class VoteImpostorUseCase {
  async execute(
    game: Game,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    return game.voteImpostor(playerId, votedForId);
  }
}
