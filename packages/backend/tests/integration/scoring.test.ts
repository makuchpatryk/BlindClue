import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../../src/core/domain/entities/game.js";
import { Player } from "../../src/core/domain/entities/player.js";
import { PlayerId } from "../../src/core/domain/value-objects/player-id.js";
import { CalculateScoresUseCase } from "../../src/core/domain/use-cases/calculate-scores.use-case.js";

describe("Scoring Logic", () => {
  let game: Game;
  let calculateScoresUseCase: CalculateScoresUseCase;
  let player1: Player;
  let player2: Player;
  let player3: Player;

  beforeEach(() => {
    game = new Game("game_1", "word_1", "animals");
    calculateScoresUseCase = new CalculateScoresUseCase();

    player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    player2 = new Player(PlayerId.generate(), "game_1", "Bob");
    player3 = new Player(PlayerId.generate(), "game_1", "Charlie");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);
    game.startGame();
  });

  it("impostor not caught gets +2, others get +1", () => {
    const impostorId = game.getImpostorId();

    // Complete 3 rounds
    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    // Vote for wrong person (not impostor)
    const nonImpostorId = game
      .getPlayers()
      .find((p) => p.getId().value !== impostorId)
      ?.getId().value;

    game.voteImpostor(player1.getId().value, nonImpostorId!);
    game.voteImpostor(player2.getId().value, nonImpostorId!);
    game.voteImpostor(player3.getId().value, nonImpostorId!);

    const scores = calculateScoresUseCase.execute(game, false);

    expect(scores.get(impostorId!)).toBe(2); // Impostor not caught
    // Check non-impostors got 1 point
    game.getPlayers().forEach((p) => {
      if (p.getId().value !== impostorId) {
        expect(scores.get(p.getId().value)).toBe(1);
      }
    });
  });

  it("impostor caught and guesses correctly gets +2", () => {
    const impostorId = game.getImpostorId();

    // Complete rounds and vote for impostor
    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.voteImpostor(player1.getId().value, impostorId!);
    game.voteImpostor(player2.getId().value, impostorId!);
    game.voteImpostor(player3.getId().value, impostorId!);

    const scores = calculateScoresUseCase.execute(game, true);

    expect(scores.get(impostorId!)).toBe(2); // Caught but guessed correctly
    expect(scores.get(player1.getId().value)).toBe(2); // Voted correctly
    expect(scores.get(player2.getId().value)).toBe(2);
    expect(scores.get(player3.getId().value)).toBe(2);
  });

  it("impostor caught and guesses wrong gets +1", () => {
    const impostorId = game.getImpostorId();

    // Complete rounds and vote for impostor
    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.submitDescription(player1.getId().value, "desc1");
    game.submitDescription(player2.getId().value, "desc2");
    game.submitDescription(player3.getId().value, "desc3");

    game.voteImpostor(player1.getId().value, impostorId!);
    game.voteImpostor(player2.getId().value, impostorId!);
    game.voteImpostor(player3.getId().value, impostorId!);

    const scores = calculateScoresUseCase.execute(game, false);

    expect(scores.get(impostorId!)).toBe(1); // Caught and guessed wrong
    // Check all voters (including impostor voting for themselves) got 2 points
    game.getPlayers().forEach((p) => {
      if (p.getId().value !== impostorId) {
        expect(scores.get(p.getId().value)).toBe(2);
      }
    });
  });
});
