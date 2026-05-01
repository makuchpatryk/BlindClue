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
  ): void;
  broadcastRoundSubmitted(gameId: string, round: number): void;
  broadcastVotingStarted(gameId: string): void;
  broadcastGameEnded(gameId: string): void;
  broadcastImpostorDoneGuessing(gameId: string): void;
  broadcastPlayerWordSubmitted(
    gameId: string,
    playerWords: Record<string, string[]>,
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
    console.log(`[Orchestrator] guessWord called for game ${gameId}`);
    const result = await this.gameApplicationService.guessWord(
      gameId,
      guess,
      word,
    );
    console.log(`[Orchestrator] guessWord result:`, result);

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        console.log(`[Orchestrator] Broadcasting GameEnded to all players...`);
        this.socketGateway.broadcastGameEnded(gameId);
        console.log(`[Orchestrator] Broadcasting impostorDoneGuessing...`);
        this.socketGateway.broadcastImpostorDoneGuessing(gameId);
        console.log(`[Orchestrator] Deleting game...`);
        this.gameManager.deleteGame(gameId);
      } else {
        console.error(`[Orchestrator] Game not found after guessWord`);
      }
    } else {
      console.error(`[Orchestrator] guessWord failed:`, result.error);
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
}
