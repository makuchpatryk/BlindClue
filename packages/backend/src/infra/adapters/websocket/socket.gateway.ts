import { Server } from "socket.io";
import {
  RoundSubmittedEvent,
  VotingStartedEvent,
  VotesRevealedEvent,
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
  ): void {
    const event: GameStartedEvent = {
      gameId,
      category,
      impostorId,
      players,
    };
    this.io.to(gameId).emit("GameStarted", event);
  }

  broadcastWordRevealed(
    gameId: string,
    impostorSocketId: string,
    word: string,
  ): void {
    const room = this.io.sockets.adapter.rooms.get(gameId);
    if (room) {
      for (const socketId of room) {
        if (socketId !== impostorSocketId) {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit("wordRevealed", { gameId, word });
          }
        }
      }
    }
  }

  broadcastRoundSubmitted(gameId: string, round: number): void {
    const event: RoundSubmittedEvent = { gameId, round };
    this.io.to(gameId).emit("RoundSubmitted", event);
  }

  broadcastVotingStarted(gameId: string): void {
    const event: VotingStartedEvent = { gameId };
    this.io.to(gameId).emit("VotingStarted", event);
  }

  broadcastVotesRevealed(
    gameId: string,
    voteMap: Map<string, number>,
    mostVoted: string,
  ): void {
    const event: VotesRevealedEvent = {
      gameId,
      voteMap: Object.fromEntries(voteMap),
      mostVoted,
    };
    this.io.to(gameId).emit("VotesRevealed", event);
  }

  broadcastGameEnded(
    gameId: string,
    scores: Array<{ playerId: string; playerName: string; score: number }>,
  ): void {
    const event: GameEndedEvent = { gameId, scores };
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

  broadcastAllPlayersVoted(gameId: string): void {
    this.io.to(gameId).emit("AllPlayersVoted", { gameId });
  }

  broadcastWordReveal(gameId: string, word: string): void {
    this.io.to(gameId).emit("wordRevealed", { gameId, word });
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
