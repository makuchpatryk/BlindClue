import { Game } from "../entities/game.js";

export class CalculateScoresUseCase {
  execute(game: Game, impostorCorrectlyGuessed: boolean): Map<string, number> {
    const scores = new Map<string, number>();
    const impostorId = game.getImpostorId();
    const votes = game.getVotes();
    const impostorVotes = Array.from(votes.values()).filter((v) => v === impostorId).length;

    const allPlayers = game.getPlayers();

    if (impostorVotes === 0) {
      // Impostor not caught: impostor +2, others +1
      scores.set(impostorId!, 2);
      allPlayers.forEach((p) => {
        if (p.getId().value !== impostorId) {
          scores.set(p.getId().value, 1);
        }
      });
    } else {
      // Impostor caught: voters get +2, others get +0
      votes.forEach((votedForId, playerId) => {
        if (votedForId === impostorId) {
          scores.set(playerId, 2); // Voted correctly
        } else {
          scores.set(playerId, 0); // Voted wrongly
        }
      });
      // Impostor: +2 if guess correct, +1 if wrong
      scores.set(impostorId!, impostorCorrectlyGuessed ? 2 : 1);
    }

    return scores;
  }
}
