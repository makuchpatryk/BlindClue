import { Socket } from "socket.io-client";
import { GameStatus } from "@/shared/utils/game-status.js";
import {
  saveGameSession,
  clearGameSession,
} from "@/shared/utils/session-storage.js";
import { SOCKET_EVENTS } from "@/shared/utils/socket-events.js";
import { IMPOSTOR_DONE_GUESSING_DELAY } from "@/shared/utils/constants.js";
import { JoinStatus, type GameStore } from "@/shared/types/game.js";

export class GameClientService {
  private static instance: GameClientService;

  private constructor(
    private socket: Socket,
    private gameStore: GameStore,
  ) {
    this.setupSocketListeners();
  }

  static getInstance(socket: Socket, gameStore: GameStore): GameClientService {
    if (!GameClientService.instance) {
      GameClientService.instance = new GameClientService(socket, gameStore);
    }
    return GameClientService.instance;
  }

  private setupSocketListeners(): void {
    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      this.gameStore.setGameStarted({
        gameId: data.gameId,
        category: data.category,
        impostorId: data.impostorId,
        players: data.players,
        numberOfRounds: data.numberOfRounds,
      });
      if (data.word) {
        this.gameStore.setWord(data.word);
      }
    });

    this.socket.on(SOCKET_EVENTS.GAME_RESTARTED, (data) => {
      this.gameStore.resetGameProgress();
      this.gameStore.setGameStarted({
        gameId: data.gameId,
        category: data.category,
        impostorId: data.impostorId,
        players: data.players,
        numberOfRounds: data.numberOfRounds,
      });
      if (data.word) {
        this.gameStore.setWord(data.word);
      }
    });

    this.socket.on(SOCKET_EVENTS.ROUND_SUBMITTED, (data) => {
      this.gameStore.setRoundSubmitted(data.round, data.descriptions);
    });

    this.socket.on(SOCKET_EVENTS.VOTING_STARTED, () => {
      this.gameStore.setStatus(GameStatus.VOTING);
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, () => {
      this.gameStore.setStatus(GameStatus.ENDED);
      this.gameStore.setImpostorDoneGuessing(true);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      this.gameStore.addPlayer({
        id: data.playerId,
        name: data.playerName,
      });
    });

    this.socket.on(SOCKET_EVENTS.JOIN_REQUEST, (data) => {
      this.gameStore.addJoinRequest({
        requestId: data.requestId,
        playerName: data.playerName,
      });
    });

    this.socket.on(SOCKET_EVENTS.JOIN_GAME_SUCCESS, (data) => {
      const myPlayer = data.players.find((p: any) => p.id === data.playerId);
      this.gameStore.setMyPlayer(data.playerId, myPlayer?.name || "");
      this.gameStore.setPlayers(data.players);
      this.gameStore.setJoinStatus(JoinStatus.APPROVED);
      saveGameSession(this.gameStore.gameId, data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.JOIN_GAME_ERROR, () => {
      this.gameStore.setJoinStatus(JoinStatus.REJECTED);
      clearGameSession();
    });

    this.socket.on(SOCKET_EVENTS.REJOIN_SUCCESS, (data) => {
      const gameId = data.gameId || this.gameStore.gameId;
      const myPlayer = data.players.find((p: any) => p.id === data.playerId);
      this.gameStore.setMyPlayer(data.playerId, myPlayer?.name || "");
      this.gameStore.setPlayers(data.players);
      if (data.category)
        this.gameStore.setGameStarted({
          gameId,
          category: data.category,
          impostorId: data.impostorId,
          players: data.players,
          numberOfRounds: data.numberOfRounds,
        });
      if (data.voteResults && data.mostVotedId) {
        this.gameStore.setVotes(data.voteResults, data.mostVotedId);
      }
      if (data.word) {
        this.gameStore.setWord(data.word);
      }
      this.gameStore.setStatus(data.status);
      this.gameStore.setJoinStatus(JoinStatus.APPROVED);
      saveGameSession(gameId, data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.REJOIN_ERROR, () => {
      this.gameStore.setJoinStatus(JoinStatus.REJECTED);
      clearGameSession();
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_TURN_ADVANCED, (data) => {
      this.gameStore.setCurrentPlayerIndex(data.currentPlayerIndex);
      this.gameStore.setPlayersClicked(data.playersClickedThisRound);
      this.gameStore.setNextButtonBlocked(data.isNextButtonBlocked);
    });

    this.socket.on(SOCKET_EVENTS.BUTTON_UNBLOCKED, (data) => {
      this.gameStore.setNextButtonBlocked(data.isNextButtonBlocked);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_VOTED, (data) => {
      this.gameStore.addVotedPlayer(data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.ALL_PLAYERS_VOTED, (data) => {
      if (data.voteResults && data.mostVotedId) {
        this.gameStore.setVotes(data.voteResults, data.mostVotedId);
      }
      if (data.word) {
        this.gameStore.setWord(data.word);
      }
      this.gameStore.setImpostorDoneGuessing(false);
      this.gameStore.setStatus();
    });

    this.socket.on(SOCKET_EVENTS.IMPOSTOR_GUESS_REQUEST, (data) => {
      if (data.voteResults && data.mostVotedId) {
        this.gameStore.setVotes(data.voteResults, data.mostVotedId);
      }
      if (data.word) {
        this.gameStore.setWord(data.word);
      }
      this.gameStore.setGuessPhaseActive(true);
      this.gameStore.setStatus(GameStatus.GUESSING);
    });

    this.socket.on(SOCKET_EVENTS.GUESS_RESULT, (data) => {
      this.gameStore.setImpostorGuess(data.guess);
      this.gameStore.setGuessResult(data.isCorrect);
      setTimeout(() => {
        this.gameStore.setImpostorDoneGuessing(true);
      }, IMPOSTOR_DONE_GUESSING_DELAY);
    });

    this.socket.on(SOCKET_EVENTS.IMPOSTOR_DONE_GUESSING, () => {
      setTimeout(() => {
        this.gameStore.setImpostorDoneGuessing(true);
      }, IMPOSTOR_DONE_GUESSING_DELAY);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_WORD_SUBMITTED, (data) => {
      this.gameStore.updatePlayerWords(data.playerWords);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("Socket error:", error);
    });
  }

  submitDescription(
    gameId: string,
    playerId: string,
    description: string,
  ): void {
    this.socket.emit("submitDescription", { gameId, playerId, description });
  }

  voteImpostor(gameId: string, playerId: string, votedForId: string): void {
    this.socket.emit("voteImpostor", { gameId, playerId, votedForId });
  }

  guessWord(gameId: string, guess: string): void {
    this.socket.emit("guessWord", { gameId, guess });
  }

  requestJoin(gameId: string, playerName: string): void {
    this.socket.emit("requestJoin", { gameId, playerName });
  }

  rejoinGame(gameId: string, playerId: string): void {
    this.socket.emit("rejoinGame", { gameId, playerId });
  }

  approveJoin(requestId: string, gameId: string): void {
    this.socket.emit("approveJoin", { requestId, gameId });
  }

  rejectJoin(requestId: string): void {
    this.socket.emit("rejectJoin", { requestId });
  }

  startGame(gameId: string): void {
    this.socket.emit("startGame", { gameId });
  }

  restartGame(gameId: string): void {
    this.socket.emit("restartGame", { gameId });
  }

  advanceTurn(
    gameId: string,
    playerId: string,
    currentPlayerIndex: number,
    playersClickedThisRound: string[],
    isNextButtonBlocked: boolean,
  ): void {
    this.socket.emit("advanceTurn", {
      gameId,
      playerId,
      currentPlayerIndex,
      playersClickedThisRound,
      isNextButtonBlocked,
    });
  }

  transitionToVoting(gameId: string): void {
    this.socket.emit("transitionToVoting", { gameId });
  }

  broadcastPlayerVoted(gameId: string, playerId: string): void {
    this.socket.emit("playerVoted", { gameId, playerId });
  }

  allPlayersVoted(gameId: string): void {
    this.socket.emit("allPlayersVoted", { gameId });
  }

  submitPlayerWord(
    gameId: string,
    playerId: string,
    word: string,
    round: number,
  ): void {
    this.socket.emit("submitPlayerWord", { gameId, playerId, word, round });
  }
}
