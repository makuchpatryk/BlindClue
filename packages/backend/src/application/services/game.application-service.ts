import { Game } from "../../core/domain/entities/game.js";
import { Player } from "../../core/domain/entities/player.js";
import { PlayerId } from "../../core/domain/value-objects/player-id.js";
import { Result, ResultError } from "../utils/result.js";
import { IWordRepository } from "../../core/domain/ports/word.repository.js";
import { GameManager } from "./game-manager.js";
import { CreateGameUseCase } from "../../core/domain/use-cases/create-game.use-case.js";
import { SubmitDescriptionUseCase } from "../../core/domain/use-cases/submit-description.use-case.js";
import { VoteImpostorUseCase } from "../../core/domain/use-cases/vote-impostor.use-case.js";
import { GuessWordUseCase } from "../../core/domain/use-cases/guess-word.use-case.js";
import { CalculateScoresUseCase } from "../../core/domain/use-cases/calculate-scores.use-case.js";
import {
  GetGameStateUseCase,
  GameStateDTO,
} from "../../core/domain/use-cases/get-game-state.use-case.js";
import { IdGenerator } from "../utils/id-generator.js";

export class GameApplicationService {
  private gameManager: GameManager;
  private createGameUseCase: CreateGameUseCase;
  private submitDescriptionUseCase: SubmitDescriptionUseCase;
  private voteImpostorUseCase: VoteImpostorUseCase;
  private guessWordUseCase: GuessWordUseCase;
  private calculateScoresUseCase: CalculateScoresUseCase;
  private getGameStateUseCase: GetGameStateUseCase;

  constructor(private wordRepository: IWordRepository) {
    this.gameManager = GameManager.getInstance();
    this.createGameUseCase = new CreateGameUseCase(wordRepository);
    this.submitDescriptionUseCase = new SubmitDescriptionUseCase();
    this.voteImpostorUseCase = new VoteImpostorUseCase();
    this.guessWordUseCase = new GuessWordUseCase();
    this.calculateScoresUseCase = new CalculateScoresUseCase();
    this.getGameStateUseCase = new GetGameStateUseCase();
  }

  async createGame(
    numberOfRounds: number = 3,
  ): Promise<Result<string, ResultError>> {
    const result = await this.createGameUseCase.execute(numberOfRounds);
    if (!result.ok) {
      return result;
    }

    const { gameId, wordId, categoryId } = result.value;
    const game = new Game(gameId, wordId, categoryId, numberOfRounds);
    this.gameManager.createGame(gameId, game);

    return { ok: true, value: gameId };
  }

  async joinGame(
    gameId: string,
    playerName: string,
  ): Promise<Result<string, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    const playerId = PlayerId.generate();
    const player = new Player(playerId, gameId, playerName);
    const result = game.addPlayer(player);

    if (result.ok) {
      return { ok: true, value: playerId.value };
    }
    return result;
  }

  async startGame(gameId: string): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return game.startGame();
  }

  async submitDescription(
    gameId: string,
    playerId: string,
    description: string,
  ): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return this.submitDescriptionUseCase.execute(game, playerId, description);
  }

  async voteImpostor(
    gameId: string,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return this.voteImpostorUseCase.execute(game, playerId, votedForId);
  }

  async guessWord(
    gameId: string,
    guess: string,
    word: string,
  ): Promise<Result<boolean, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return this.guessWordUseCase.execute(game, guess, word);
  }

  calculateScores(
    gameId: string,
    impostorCorrectlyGuessed: boolean,
  ): Result<Map<string, number>, ResultError> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    const scores = this.calculateScoresUseCase.execute(
      game,
      impostorCorrectlyGuessed,
    );
    return { ok: true, value: scores };
  }

  getGameState(gameId: string): Result<GameStateDTO, ResultError> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    const state = this.getGameStateUseCase.execute(game);
    return { ok: true, value: state as GameStateDTO };
  }
}
