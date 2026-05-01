import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "../../src/core/domain/entities/game.js";
import { Player } from "../../src/core/domain/entities/player.js";
import { PlayerId } from "../../src/core/domain/value-objects/player-id.js";
import { GameStatus } from "../../src/core/domain/value-objects/game-status.js";

describe("Game Lifecycle", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game("game_1", "word_1", "animals");
  });

  it("should create a game in LOBBY status", () => {
    expect(game.getStatus()).toBe(GameStatus.LOBBY);
    expect(game.getCurrentRound()).toBe(1);
    expect(game.getImpostorId()).toBeNull();
  });

  it("should allow players to join in LOBBY", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");

    const result1 = game.addPlayer(player1);
    const result2 = game.addPlayer(player2);

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(game.getPlayers().length).toBe(2);
  });

  it("should start game with impostor assigned", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");

    game.addPlayer(player1);
    game.addPlayer(player2);

    const result = game.startGame();

    expect(result.ok).toBe(true);
    expect(game.getStatus()).toBe(GameStatus.RUNNING);
    expect(game.getImpostorId()).not.toBeNull();
    expect([player1.getId().value, player2.getId().value]).toContain(
      game.getImpostorId(),
    );
  });

  it("should progress through 3 rounds", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.startGame();

    // Round 1
    expect(game.getCurrentRound()).toBe(1);
    game.submitDescription(player1.getId().value, "A big animal");
    game.submitDescription(player2.getId().value, "Has a long tail");
    expect(game.getCurrentRound()).toBe(2);

    // Round 2
    game.submitDescription(player1.getId().value, "Eats bananas");
    game.submitDescription(player2.getId().value, "Lives in jungle");
    expect(game.getCurrentRound()).toBe(3);

    // Round 3
    game.submitDescription(player1.getId().value, "Swings from trees");
    game.submitDescription(player2.getId().value, "Makes noise");
    expect(game.getStatus()).toBe(GameStatus.VOTING);
  });

  it("should transition to GUESSING or ENDED after all votes", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.startGame();

    const impostorId = game.getImpostorId()!;

    // Complete 3 rounds to transition to VOTING
    for (let r = 0; r < 3; r++) {
      game.submitDescription(player1.getId().value, `desc_r${r + 1}_p1`);
      game.submitDescription(player2.getId().value, `desc_r${r + 1}_p2`);
    }
    expect(game.getStatus()).toBe(GameStatus.VOTING);

    // Vote
    game.voteImpostor(player1.getId().value, player2.getId().value);
    game.voteImpostor(player2.getId().value, player1.getId().value);

    // Status depends on who is impostor and got most votes
    // With a tie, one will be selected as most voted
    const status = game.getStatus();
    expect([GameStatus.GUESSING, GameStatus.ENDED]).toContain(status);
  });

  it("should not allow more than 4 players", () => {
    const players = Array.from(
      { length: 5 },
      (_, i) => new Player(PlayerId.generate(), "game_1", `Player${i + 1}`),
    );

    for (let i = 0; i < 4; i++) {
      const result = game.addPlayer(players[i]);
      expect(result.ok).toBe(true);
    }

    const result = game.addPlayer(players[4]);
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("GAME_FULL");
  });

  it("should require at least 2 players to start", () => {
    const player = new Player(PlayerId.generate(), "game_1", "Alice");
    game.addPlayer(player);

    const result = game.startGame();
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("NOT_ENOUGH_PLAYERS");
  });

  it("should transition to GUESSING if impostor is most voted", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");
    const player3 = new Player(PlayerId.generate(), "game_1", "Charlie");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);
    game.startGame();

    const impostorId = game.getImpostorId()!;

    // Complete 3 rounds to transition to VOTING
    for (let r = 0; r < 3; r++) {
      game.submitDescription(player1.getId().value, `desc_r${r + 1}_p1`);
      game.submitDescription(player2.getId().value, `desc_r${r + 1}_p2`);
      game.submitDescription(player3.getId().value, `desc_r${r + 1}_p3`);
    }

    // Setup votes so impostor gets most votes
    game.voteImpostor(player1.getId().value, impostorId);
    game.voteImpostor(player2.getId().value, impostorId);
    game.voteImpostor(player3.getId().value, impostorId);

    // Status should be GUESSING
    expect(game.getStatus()).toBe(GameStatus.GUESSING);

    // Impostor should be able to guess
    const guessResult = game.guessWord("lion", "lion");
    expect(guessResult.ok).toBe(true);
    expect(guessResult.value).toBe(true);
  });

  it("should end game immediately if impostor not most voted", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");
    const player3 = new Player(PlayerId.generate(), "game_1", "Charlie");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);
    game.startGame();

    const impostorId = game.getImpostorId()!;
    const otherPlayerId = [
      player1.getId().value,
      player2.getId().value,
      player3.getId().value,
    ].find((id) => id !== impostorId)!;

    // Complete 3 rounds to transition to VOTING
    for (let r = 0; r < 3; r++) {
      game.submitDescription(player1.getId().value, `desc_r${r + 1}_p1`);
      game.submitDescription(player2.getId().value, `desc_r${r + 1}_p2`);
      game.submitDescription(player3.getId().value, `desc_r${r + 1}_p3`);
    }

    // Setup votes so someone else gets most votes
    game.voteImpostor(player1.getId().value, otherPlayerId);
    game.voteImpostor(player2.getId().value, otherPlayerId);
    game.voteImpostor(player3.getId().value, impostorId);

    // Status should be ENDED (not GUESSING)
    expect(game.getStatus()).toBe(GameStatus.ENDED);

    // Impostor should NOT be able to guess
    const guessResult = game.guessWord("lion", "lion");
    expect(guessResult.ok).toBe(false);
    expect(guessResult.error?.code).toBe("INVALID_STATE");
  });
});
