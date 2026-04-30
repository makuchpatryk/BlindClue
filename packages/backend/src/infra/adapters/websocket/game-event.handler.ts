import { Socket } from 'socket.io';
import { GameOrchestrator } from '../../../application/services/game.orchestrator.js';
import { GameManager } from '../../../application/services/game-manager.js';
import { IWordRepository } from '../../../core/domain/ports/word.repository.js';
import { SocketGateway } from './socket.gateway.js';

interface PendingRequest {
  socket: Socket;
  playerName: string;
}

interface SocketPlayer {
  gameId: string;
  playerId: string;
}

export class GameEventHandler {
  private gameManager: GameManager;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private hostSockets: Map<string, string> = new Map();
  private socketToPlayer: Map<string, SocketPlayer> = new Map();
  private hostPlayers: Map<string, string> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DISCONNECT_TIMEOUT_MS = 2 * 60 * 1000;

  constructor(
    private gameOrchestrator: GameOrchestrator,
    private wordRepository: IWordRepository,
    private socketGateway: SocketGateway
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
        socket.join(data.gameId);
        const result = await this.gameOrchestrator.joinGame(data.gameId, data.playerName);
        if (result.ok) {
          this.hostSockets.set(data.gameId, socket.id);
          this.hostPlayers.set(data.gameId, result.value);
          this.socketToPlayer.set(socket.id, { gameId: data.gameId, playerId: result.value });
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
          this.socketToPlayer.set(pendingRequest.socket.id, { gameId: data.gameId, playerId: result.value });
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
      if (result.ok) {
        const game = this.gameManager.getGame(data.gameId);
        if (game) {
          const impostorId = game.getImpostorId();
          const word = game.getWord();
          if (impostorId && word) {
            const impostorSocketId = Array.from(this.socketToPlayer.entries()).find(
              ([_, player]) => player.playerId === impostorId && player.gameId === data.gameId
            )?.[0];
            if (impostorSocketId) {
              this.socketGateway.broadcastWordRevealed(data.gameId, impostorSocketId, word);
            }
          }
        }
      } else {
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

    socket.on('rejoinGame', async (data: { gameId: string; playerId: string }) => {
      const game = this.gameManager.getGame(data.gameId);
      if (!game) {
        socket.emit('rejoinError', { error: 'Game not found' });
        return;
      }

      const player = game.getPlayers().find(p => p.getId().value === data.playerId);
      if (!player) {
        socket.emit('rejoinError', { error: 'Player not found' });
        return;
      }

      const timerKey = `${data.gameId}:${data.playerId}`;
      const existingTimer = this.disconnectTimers.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.disconnectTimers.delete(timerKey);
      }

      socket.join(data.gameId);
      this.socketToPlayer.set(socket.id, { gameId: data.gameId, playerId: data.playerId });

      if (this.hostPlayers.get(data.gameId) === data.playerId) {
        this.hostSockets.set(data.gameId, socket.id);
      }

      const players = game.getPlayers().map(p => ({ id: p.getId().value, name: p.getName(), score: p.getScore() }));
      socket.emit('rejoinSuccess', {
        playerId: data.playerId,
        players,
        status: game.getStatus(),
        category: game.getCategoryName(),
        impostorId: game.getImpostorId(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const socketPlayer = this.socketToPlayer.get(socket.id);
      if (socketPlayer) {
        const { gameId, playerId } = socketPlayer;
        this.socketToPlayer.delete(socket.id);

        const timerKey = `${gameId}:${playerId}`;
        const existingTimer = this.disconnectTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
          const stillConnected = Array.from(this.socketToPlayer.values()).some(sp => sp.gameId === gameId);
          if (!stillConnected) {
            this.gameManager.deleteGame(gameId);
            this.hostSockets.delete(gameId);
            this.hostPlayers.delete(gameId);
          }
          this.disconnectTimers.delete(timerKey);
        }, this.DISCONNECT_TIMEOUT_MS);

        this.disconnectTimers.set(timerKey, timer);
      }
    });
  }
}
