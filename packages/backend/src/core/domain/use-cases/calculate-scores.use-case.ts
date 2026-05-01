import { Game } from "../entities/game.js";

export class CalculateScoresUseCase {
  execute(game: Game, impostorCorrectlyGuessed: boolean): Map<string, number> {
    const scores = new Map<string, number>();
    const impostorId = game.getImpostorId();
    const voteMap = game.getVoteResults();
    const impostorVotes = voteMap.get(impostorId!) ?? 0;

    const allPlayers = game.getPlayers();

    if (impostorVotes === 0) {
      // Impostor not caught: +2 points
      scores.set(impostorId!, 2);
      allPlayers.forEach((p) => {
        if (p.getId().value !== impostorId) {
          scores.set(p.getId().value, 1); // Others: +1
        }
      });
    } else {
      // Impostor caught: voters get +2, non-voters get +0
      voteMap.forEach((_, votedForId) => {
        scores.set(votedForId, 2);
      });
      // Impostor: +1 if guess correct
      scores.set(impostorId!, impostorCorrectlyGuessed ? 2 : 1);
    }

    return scores;
  }
}
