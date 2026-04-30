import { Socket } from 'socket.io-client';
import { useGameStore } from '../../game/stores/game.store.js';

export class GameClientService {
  private static instance: GameClientService;

  private constructor(private socket: Socket) {
    this.setupSocketListeners();
  }

  static getInstance(socket: Socket): GameClientService {
    if (!GameClientService.instance) {
      GameClientService.instance = new GameClientService(socket);
    }
    return GameClientService.instance;
  }

  private setupSocketListeners(): void {
    const gameStore = useGameStore();

    this.socket.on('GameStarted', (data) => {
      gameStore.setGameStarted({
        gameId: data.gameId,
        category: data.category,
        impostorId: data.impostorId,
        players: data.players,
      });
    });

    this.socket.on('RoundSubmitted', (data) => {
      gameStore.setRoundSubmitted(data.round);
    });

    this.socket.on('VotingStarted', () => {
      gameStore.setStatus('VOTING');
    });

    this.socket.on('VotesRevealed', (data) => {
      gameStore.setVotes(data.voteMap, data.mostVoted);
    });

    this.socket.on('GameEnded', (data) => {
      gameStore.setStatus('ENDED');
      gameStore.setFinalScores(data.scores);
    });

    this.socket.on('PlayerJoined', (data) => {
      gameStore.addPlayer({
        id: data.playerId,
        name: data.playerName,
        score: 0,
      });
    });

    this.socket.on('JoinRequest', (data) => {
      gameStore.addJoinRequest({
        requestId: data.requestId,
        playerName: data.playerName,
      });
    });

    this.socket.on('joinGameSuccess', (data) => {
      gameStore.setMyPlayer(data.playerId, '');
      gameStore.setPlayers(data.players);
      gameStore.setJoinStatus('approved');
    });

    this.socket.on('joinGameError', (data) => {
      gameStore.setJoinStatus('rejected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  submitDescription(gameId: string, playerId: string, description: string): void {
    this.socket.emit('submitDescription', { gameId, playerId, description });
  }

  voteImpostor(gameId: string, playerId: string, votedForId: string): void {
    this.socket.emit('voteImpostor', { gameId, playerId, votedForId });
  }

  guessWord(gameId: string, guess: string): void {
    this.socket.emit('guessWord', { gameId, guess });
  }

  requestJoin(gameId: string, playerName: string): void {
    this.socket.emit('requestJoin', { gameId, playerName });
  }

  approveJoin(requestId: string, gameId: string): void {
    this.socket.emit('approveJoin', { requestId, gameId });
  }

  rejectJoin(requestId: string): void {
    this.socket.emit('rejectJoin', { requestId });
  }

  startGame(gameId: string): void {
    this.socket.emit('startGame', { gameId });
  }
}
