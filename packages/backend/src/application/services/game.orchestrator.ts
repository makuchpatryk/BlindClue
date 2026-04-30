import { GameApplicationService } from './game.application-service.js';
import { GameManager } from './game-manager.js';
import { Result, ResultError } from '../utils/result.js';
import { GameStatus } from '../../core/domain/value-objects/game-status.js';

export interface JoinRequestEvent {
  gameId: string;
  requestId: string;
  playerName: string;
}

export interface SocketGateway {
  broadcastGameCreated(gameId: string): void;
  broadcastPlayerJoined(gameId: string, playerId: string, playerName: string): void;
  broadcastGameStarted(gameId: string): void;
  broadcastRoundSubmitted(gameId: string, round: number): void;
  broadcastVotingStarted(gameId: string): void;
  broadcastVotesRevealed(gameId: string, voteMap: Map<string, number>, mostVoted: string): void;
  broadcastGameEnded(gameId: string, scores: Array<{ playerId: string; playerName: string; score: number }>): void;
  sendJoinRequestToHost(hostSocketId: string, event: JoinRequestEvent): void;
}

export class GameOrchestrator {
  private gameManager: GameManager;

  constructor(
    private gameApplicationService: GameApplicationService,
    private socketGateway: SocketGateway
  ) {
    this.gameManager = GameManager.getInstance();
  }

  async createGame(): Promise<Result<string, ResultError>> {
    const result = await this.gameApplicationService.createGame();
    if (result.ok) {
      this.socketGateway.broadcastGameCreated(result.value);
    }
    return result;
  }

  async joinGame(gameId: string, playerName: string): Promise<Result<string, ResultError>> {
    const result = await this.gameApplicationService.joinGame(gameId, playerName);
    if (result.ok) {
      this.socketGateway.broadcastPlayerJoined(gameId, result.value, playerName);
    }
    return result;
  }

  async startGame(gameId: string): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.startGame(gameId);
    if (result.ok) {
      this.socketGateway.broadcastGameStarted(gameId);
    }
    return result;
  }

  async submitDescription(gameId: string, playerId: string, description: string): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.submitDescription(gameId, playerId, description);

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        this.socketGateway.broadcastRoundSubmitted(gameId, game.getCurrentRound());

        if (game.getStatus() === GameStatus.VOTING) {
          this.socketGateway.broadcastVotingStarted(gameId);
        }
      }
    }

    return result;
  }

  async voteImpostor(gameId: string, playerId: string, votedForId: string): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.voteImpostor(gameId, playerId, votedForId);

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game && game.getStatus() === GameStatus.ENDED) {
        const voteResults = game.getVoteResults();
        const mostVoted = game.getMostVoted();
        this.socketGateway.broadcastVotesRevealed(gameId, voteResults, mostVoted!);
      }
    }

    return result;
  }

  async guessWord(gameId: string, guess: string, word: string): Promise<Result<boolean, ResultError>> {
    const result = await this.gameApplicationService.guessWord(gameId, guess, word);

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        const scoresResult = this.gameApplicationService.calculateScores(gameId, result.value);
        if (scoresResult.ok) {
          const scoresMap = scoresResult.value;
          const scores = game.getPlayers().map(p => ({
            playerId: p.getId().value,
            playerName: p.getName(),
            score: scoresMap.get(p.getId().value) || 0,
          }));
          this.socketGateway.broadcastGameEnded(gameId, scores);
          this.gameManager.deleteGame(gameId);
        }
      }
    }

    return result;
  }

  sendJoinRequestToHost(hostSocketId: string, event: JoinRequestEvent): void {
    this.socketGateway.sendJoinRequestToHost(hostSocketId, event);
  }
}
