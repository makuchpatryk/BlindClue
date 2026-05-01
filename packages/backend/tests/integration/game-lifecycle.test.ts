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

  it("should transition to ENDED after all votes", () => {
    const player1 = new Player(PlayerId.generate(), "game_1", "Alice");
    const player2 = new Player(PlayerId.generate(), "game_1", "Bob");

    game.addPlayer(player1);
    game.addPlayer(player2);
    game.startGame();

    // Force to voting
    game.voteImpostor(player1.getId().value, player2.getId().value);
    expect(game.getStatus()).toBe(GameStatus.VOTING);

    game.voteImpostor(player2.getId().value, player1.getId().value);
    expect(game.getStatus()).toBe(GameStatus.ENDED);
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
});
