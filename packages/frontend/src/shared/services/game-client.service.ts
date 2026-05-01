import { Socket } from "socket.io-client";
import { useGameStore } from "@/features/game/stores/game.store.js";
import { GameStatus } from "../utils/game-status.js";
import { saveGameSession, clearGameSession } from "../utils/session-storage.js";
import { SOCKET_EVENTS } from "../utils/socket-events.js";
import { IMPOSTOR_DONE_GUESSING_DELAY } from "../utils/constants.js";

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

    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      gameStore.setGameStarted({
        gameId: data.gameId,
        category: data.category,
        impostorId: data.impostorId,
        players: data.players,
        numberOfRounds: data.numberOfRounds,
      });
    });

    this.socket.on(SOCKET_EVENTS.ROUND_SUBMITTED, (data) => {
      gameStore.setRoundSubmitted(data.round, data.descriptions);
    });

    this.socket.on(SOCKET_EVENTS.VOTING_STARTED, () => {
      gameStore.setStatus(GameStatus.VOTING);
    });

    this.socket.on(SOCKET_EVENTS.VOTES_REVEALED, (data) => {
      gameStore.setVotes(data.voteMap, data.mostVoted);
      gameStore.setStatus(data.gameStatus);
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data) => {
      gameStore.setStatus(GameStatus.ENDED);
      gameStore.setImpostorDoneGuessing(true);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      gameStore.addPlayer({
        id: data.playerId,
        name: data.playerName,
      });
    });

    this.socket.on(SOCKET_EVENTS.JOIN_REQUEST, (data) => {
      gameStore.addJoinRequest({
        requestId: data.requestId,
        playerName: data.playerName,
      });
    });

    this.socket.on(SOCKET_EVENTS.JOIN_GAME_SUCCESS, (data) => {
      gameStore.setMyPlayer(data.playerId, "");
      gameStore.setPlayers(data.players);
      gameStore.setJoinStatus("approved");
      saveGameSession(gameStore.gameId, data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.JOIN_GAME_ERROR, (data) => {
      gameStore.setJoinStatus("rejected");
      clearGameSession();
    });

    this.socket.on(SOCKET_EVENTS.REJOIN_SUCCESS, (data) => {
      const gameId = data.gameId || gameStore.gameId;
      gameStore.setMyPlayer(data.playerId, "");
      gameStore.setPlayers(data.players);
      gameStore.setStatus(data.status);
      if (data.category)
        gameStore.setGameStarted({
          gameId,
          category: data.category,
          impostorId: data.impostorId,
          players: data.players,
          numberOfRounds: data.numberOfRounds,
        });
      gameStore.setJoinStatus("approved");
      saveGameSession(gameId, data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.REJOIN_ERROR, () => {
      gameStore.setJoinStatus("rejected");
      clearGameSession();
    });

    this.socket.on(SOCKET_EVENTS.WORD_REVEALED, (data) => {
      gameStore.setWord(data.word);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_TURN_ADVANCED, (data) => {
      gameStore.setCurrentPlayerIndex(data.currentPlayerIndex);
      gameStore.setPlayersClicked(data.playersClickedThisRound);
      gameStore.setNextButtonBlocked(data.isNextButtonBlocked);
    });

    this.socket.on(SOCKET_EVENTS.BUTTON_UNBLOCKED, (data) => {
      gameStore.setNextButtonBlocked(data.isNextButtonBlocked);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_VOTED, (data) => {
      gameStore.addVotedPlayer(data.playerId);
    });

    this.socket.on(SOCKET_EVENTS.ALL_PLAYERS_VOTED, (data) => {
      gameStore.setImpostorDoneGuessing(false);
    });

    this.socket.on(SOCKET_EVENTS.IMPOSTOR_DONE_GUESSING, (data) => {
      setTimeout(() => {
        gameStore.setImpostorDoneGuessing(true);
      }, IMPOSTOR_DONE_GUESSING_DELAY);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_WORD_SUBMITTED, (data) => {
      gameStore.updatePlayerWords(data.playerWords);
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

  unblockButton(gameId: string): void {
    this.socket.emit("unblockButton", { gameId });
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
