import { Server } from "socket.io";
import {
  RoundSubmittedEvent,
  VotingStartedEvent,
  GameEndedEvent,
  PlayerJoinedEvent,
  GameStartedEvent,
  GameCreatedEvent,
  JoinRequestEvent,
} from "./events.js";

export class SocketGateway {
  constructor(private io: Server) {}

  broadcastGameCreated(gameId: string): void {
    const event: GameCreatedEvent = { gameId };
    this.io.emit("GameCreated", event);
  }

  broadcastPlayerJoined(
    gameId: string,
    playerId: string,
    playerName: string,
  ): void {
    const event: PlayerJoinedEvent = { gameId, playerId, playerName };
    this.io.to(gameId).emit("PlayerJoined", event);
  }

  broadcastGameStarted(
    gameId: string,
    category: string,
    impostorId: string,
    players: any[],
    numberOfRounds: number = 3,
  ): void {
    const event: GameStartedEvent = {
      gameId,
      category,
      impostorId,
      numberOfRounds,
      players,
    };
    this.io.to(gameId).emit("GameStarted", event);
  }

  broadcastRoundSubmitted(gameId: string, round: number): void {
    const event: RoundSubmittedEvent = { gameId, round };
    this.io.to(gameId).emit("RoundSubmitted", event);
  }

  broadcastVotingStarted(gameId: string): void {
    const event: VotingStartedEvent = { gameId };
    this.io.to(gameId).emit("VotingStarted", event);
  }

  broadcastGameEnded(gameId: string): void {
    const event: GameEndedEvent = { gameId };
    this.io.to(gameId).emit("GameEnded", event);
  }

  sendJoinRequestToHost(hostSocketId: string, event: JoinRequestEvent): void {
    this.io.to(hostSocketId).emit("JoinRequest", event);
  }

  broadcastPlayerTurnAdvanced(
    gameId: string,
    currentPlayerIndex: number,
    playersClickedThisRound: string[],
    isNextButtonBlocked: boolean,
  ): void {
    this.io.to(gameId).emit("PlayerTurnAdvanced", {
      gameId,
      currentPlayerIndex,
      playersClickedThisRound,
      isNextButtonBlocked,
    });
  }

  broadcastButtonUnblocked(gameId: string): void {
    this.io
      .to(gameId)
      .emit("ButtonUnblocked", { gameId, isNextButtonBlocked: false });
  }

  broadcastVotingPhaseStarted(gameId: string): void {
    this.io.to(gameId).emit("VotingStarted", { gameId });
  }

  broadcastPlayerVoted(gameId: string, playerId: string): void {
    this.io.to(gameId).emit("PlayerVoted", { gameId, playerId });
  }

  broadcastAllPlayersVoted(
    gameId: string,
    voteResults: Record<string, number>,
    mostVotedId: string | null,
    word: string,
  ): void {
    this.io.to(gameId).emit("AllPlayersVoted", {
      gameId,
      voteResults,
      mostVotedId,
      word,
    });
  }

  broadcastImpostorDoneGuessing(gameId: string): void {
    this.io.to(gameId).emit("impostorDoneGuessing", { gameId });
  }

  broadcastPlayerWordSubmitted(
    gameId: string,
    playerWords: Record<string, string[]>,
  ): void {
    this.io.to(gameId).emit("PlayerWordSubmitted", { gameId, playerWords });
  }
}
