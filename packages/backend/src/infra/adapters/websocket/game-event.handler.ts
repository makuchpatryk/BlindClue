import { Socket } from 'socket.io';
import { GameOrchestrator } from '../../../application/services/game.orchestrator.js';
import { GameManager } from '../../../application/services/game-manager.js';
import { IWordRepository } from '../../../core/domain/ports/word.repository.js';

export class GameEventHandler {
  private gameManager: GameManager;

  constructor(
    private gameOrchestrator: GameOrchestrator,
    private wordRepository: IWordRepository
  ) {
    this.gameManager = GameManager.getInstance();
  }

  register(socket: Socket): void {
    socket.on('joinGame', async (data: { gameId: string; playerName: string }) => {
      const result = await this.gameOrchestrator.joinGame(data.gameId, data.playerName);
      if (result.ok) {
        socket.join(data.gameId);
        socket.emit('joinGameSuccess', { playerId: result.value });
      } else {
        socket.emit('joinGameError', { error: result.error });
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
