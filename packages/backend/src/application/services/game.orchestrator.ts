import { GameApplicationService } from "./game.application-service.js";
import { GameManager } from "./game-manager.js";
import { Result, ResultError } from "../utils/result.js";
import { GameStatus } from "../../core/domain/value-objects/game-status.js";
import { IWordRepository } from "../../core/domain/ports/word.repository.js";
import { ICategoryRepository } from "../../core/domain/ports/category.repository.js";

export interface JoinRequestEvent {
  gameId: string;
  requestId: string;
  playerName: string;
}

export interface SocketGateway {
  broadcastGameCreated(gameId: string): void;
  broadcastPlayerJoined(
    gameId: string,
    playerId: string,
    playerName: string,
  ): void;
  broadcastGameStarted(
    gameId: string,
    category: string,
    impostorId: string,
    players: Array<{ id: string; name: string }>,
    numberOfRounds?: number,
    word?: string,
  ): void;
  broadcastRoundSubmitted(gameId: string, round: number): void;
  broadcastVotingStarted(gameId: string): void;
  broadcastGameEnded(gameId: string): void;
  broadcastGameRestarted(
    gameId: string,
    category: string,
    impostorId: string,
    players: Array<{ id: string; name: string }>,
    numberOfRounds?: number,
    word?: string,
  ): void;
  broadcastImpostorDoneGuessing(gameId: string): void;
  broadcastPlayerWordSubmitted(
    gameId: string,
    playerWords: Record<string, string[]>,
  ): void;
  broadcastImpostorGuessRequest(
    gameId: string,
    voteResults: Record<string, number>,
    mostVotedId: string | null,
    word: string,
  ): void;
  broadcastGuessResult(
    gameId: string,
    guess: string,
    isCorrect: boolean,
    word: string,
  ): void;
  sendJoinRequestToHost(hostSocketId: string, event: JoinRequestEvent): void;
}

export class GameOrchestrator {
  private gameManager: GameManager;

  constructor(
    private gameApplicationService: GameApplicationService,
    private socketGateway: SocketGateway,
    private wordRepository: IWordRepository,
    private categoryRepository: ICategoryRepository,
  ) {
    this.gameManager = GameManager.getInstance();
  }

  async createGame(
    numberOfRounds: number = 3,
  ): Promise<Result<string, ResultError>> {
    const result = await this.gameApplicationService.createGame(numberOfRounds);
    if (result.ok) {
      this.socketGateway.broadcastGameCreated(result.value);
    }
    return result;
  }

  async joinGame(
    gameId: string,
    playerName: string,
  ): Promise<Result<string, ResultError>> {
    const result = await this.gameApplicationService.joinGame(
      gameId,
      playerName,
    );
    if (result.ok) {
      this.socketGateway.broadcastPlayerJoined(
        gameId,
        result.value,
        playerName,
      );
    }
    return result;
  }

  async startGame(gameId: string): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.startGame(gameId);
    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        const wordResult = await this.wordRepository.findById(game.getWordId());
        if (wordResult.ok) {
          const categoryResult = await this.categoryRepository.findById(
            wordResult.value.getCategoryId(),
          );
          if (categoryResult.ok) {
            game.setCategoryName(categoryResult.value.name);
          }
          game.setWord(wordResult.value.getText());
        }
        const players = game
          .getPlayers()
          .map((p) => ({ id: p.getId().value, name: p.getName() }));
        this.socketGateway.broadcastGameStarted(
          gameId,
          game.getCategoryName(),
          game.getImpostorId()!,
          players,
          game.getNumberOfRounds(),
          game.getWord(),
        );
      }
    }
    return result;
  }

  async submitDescription(
    gameId: string,
    playerId: string,
    description: string,
  ): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.submitDescription(
      gameId,
      playerId,
      description,
    );

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        this.socketGateway.broadcastRoundSubmitted(
          gameId,
          game.getCurrentRound(),
        );

        if (game.getStatus() === GameStatus.VOTING) {
          this.socketGateway.broadcastVotingStarted(gameId);
        }
      }
    }

    return result;
  }

  async voteImpostor(
    gameId: string,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.voteImpostor(
      gameId,
      playerId,
      votedForId,
    );

    return result;
  }

  async guessWord(
    gameId: string,
    guess: string,
    word: string,
  ): Promise<Result<boolean, ResultError>> {
    const result = await this.gameApplicationService.guessWord(
      gameId,
      guess,
      word,
    );

    if (result.ok) {
      console.log(
        `[Orchestrator.guessWord] guess="${guess}", word="${word}", isCorrect=${result.value}`,
      );
      const game = this.gameManager.getGame(gameId);
      if (game) {
        this.socketGateway.broadcastGuessResult(
          gameId,
          guess,
          result.value,
          word,
        );
        this.socketGateway.broadcastGameEnded(gameId);
        this.gameManager.deleteGame(gameId);
      }
    }

    return result;
  }

  sendJoinRequestToHost(hostSocketId: string, event: JoinRequestEvent): void {
    this.socketGateway.sendJoinRequestToHost(hostSocketId, event);
  }

  async submitPlayerWord(
    gameId: string,
    playerId: string,
    word: string,
  ): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    const result = game.submitPlayerWord(playerId, word);
    if (result.ok) {
      this.socketGateway.broadcastPlayerWordSubmitted(
        gameId,
        game.getPlayerWords(),
      );
    }
    return result;
  }

  async restartGame(gameId: string): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    const wordResult = await this.wordRepository.getRandomWord();
    if (!wordResult.ok) {
      return wordResult;
    }

    const newWord = wordResult.value;
    game.setWordId(newWord.getId());
    game.setCategoryId(newWord.getCategoryId());
    game.resetGameState();

    const startResult = game.startGame();
    if (!startResult.ok) {
      return startResult;
    }

    const categoryResult = await this.categoryRepository.findById(
      newWord.getCategoryId(),
    );
    if (categoryResult.ok) {
      game.setCategoryName(categoryResult.value.name);
    }
    game.setWord(newWord.getText());

    const players = game
      .getPlayers()
      .map((p) => ({ id: p.getId().value, name: p.getName() }));
    this.socketGateway.broadcastGameRestarted(
      gameId,
      game.getCategoryName(),
      game.getImpostorId()!,
      players,
      game.getNumberOfRounds(),
      game.getWord(),
    );

    return { ok: true, value: undefined };
  }
}
