import { Socket } from 'socket.io';
import { GameOrchestrator } from '../../../application/services/game.orchestrator.js';
import { GameManager } from '../../../application/services/game-manager.js';
import { IWordRepository } from '../../../core/domain/ports/word.repository.js';

interface PendingRequest {
  socket: Socket;
  playerName: string;
}

export class GameEventHandler {
  private gameManager: GameManager;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private hostSockets: Map<string, string> = new Map();

  constructor(
    private gameOrchestrator: GameOrchestrator,
    private wordRepository: IWordRepository
  ) {
    this.gameManager = GameManager.getInstance();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  register(socket: Socket): void {
    socket.on('requestJoin', async (data: { gameId: string; playerName: string }) => {
      const requestId = this.generateRequestId();
      const game = this.gameManager.getGame(data.gameId);

      // First joiner becomes the host
      if (!game || game.getPlayers().length === 0) {
        this.hostSockets.set(data.gameId, socket.id);
        socket.join(data.gameId);
        const result = await this.gameOrchestrator.joinGame(data.gameId, data.playerName);
        if (result.ok) {
          const game = this.gameManager.getGame(data.gameId);
          const players = game?.getPlayers().map(p => ({ id: p.getId().value, name: p.getName(), score: p.getScore() })) ?? [];
          socket.emit('joinGameSuccess', { playerId: result.value, players });
        } else {
          socket.emit('joinGameError', { error: result.error });
        }
      } else {
        // Subsequent joiners send request to host
        this.pendingRequests.set(requestId, { socket, playerName: data.playerName });
        const hostSocketId = this.hostSockets.get(data.gameId);
        if (hostSocketId) {
          this.gameOrchestrator.sendJoinRequestToHost(hostSocketId, {
            gameId: data.gameId,
            requestId,
            playerName: data.playerName,
          });
        }
      }
    });

    socket.on('approveJoin', async (data: { requestId: string; gameId: string }) => {
      const pendingRequest = this.pendingRequests.get(data.requestId);
      if (pendingRequest) {
        pendingRequest.socket.join(data.gameId);
        const result = await this.gameOrchestrator.joinGame(data.gameId, pendingRequest.playerName);
        if (result.ok) {
          const game = this.gameManager.getGame(data.gameId);
          const players = game?.getPlayers().map(p => ({ id: p.getId().value, name: p.getName(), score: p.getScore() })) ?? [];
          pendingRequest.socket.emit('joinGameSuccess', { playerId: result.value, players });
          this.pendingRequests.delete(data.requestId);
        } else {
          pendingRequest.socket.emit('joinGameError', { error: result.error });
        }
      }
    });

    socket.on('rejectJoin', (data: { requestId: string }) => {
      const pendingRequest = this.pendingRequests.get(data.requestId);
      if (pendingRequest) {
        pendingRequest.socket.emit('joinGameError', { error: 'Host rejected your request' });
        this.pendingRequests.delete(data.requestId);
      }
    });

    socket.on('startGame', async (data: { gameId: string }) => {
      const result = await this.gameOrchestrator.startGame(data.gameId);
      if (!result.ok) {
        socket.emit('error', { error: result.error });
      }
    });

    socket.on('submitDescription', async (data: { gameId: string; playerId: string; description: string }) => {
      const result = await this.gameOrchestrator.submitDescription(
        data.gameId,
        data.playerId,
        data.description
      );
      if (!result.ok) {
        socket.emit('error', { error: result.error });
      }
    });

    socket.on('voteImpostor', async (data: { gameId: string; playerId: string; votedForId: string }) => {
      const result = await this.gameOrchestrator.voteImpostor(data.gameId, data.playerId, data.votedForId);
      if (!result.ok) {
        socket.emit('error', { error: result.error });
      }
    });

    socket.on('guessWord', async (data: { gameId: string; guess: string }) => {
      const game = this.gameManager.getGame(data.gameId);
      if (game) {
        const wordResult = await this.wordRepository.findById(game.getWordId());
        if (wordResult.ok) {
          const result = await this.gameOrchestrator.guessWord(data.gameId, data.guess, wordResult.value.getText());
          if (!result.ok) {
            socket.emit('error', { error: result.error });
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  }
}
