export interface RoundSubmittedEvent {
  gameId: string;
  round: number;
}

export interface VotingStartedEvent {
  gameId: string;
}

export interface VotesRevealedEvent {
  gameId: string;
  voteMap: Record<string, number>;
  mostVoted: string;
}

export interface ImpostorGuessRequestEvent {
  gameId: string;
}

export interface GuessResultEvent {
  gameId: string;
  isCorrect: boolean;
  word: string;
}

export interface GameEndedEvent {
  gameId: string;
  scores: Array<{
    playerId: string;
    playerName: string;
    score: number;
  }>;
}

export interface PlayerJoinedEvent {
  gameId: string;
  playerId: string;
  playerName: string;
}

export interface GameStartedEvent {
  gameId: string;
  category: string;
  impostorId: string;
  players: Array<{
    id: string;
    name: string;
  }>;
}

export interface GameCreatedEvent {
  gameId: string;
}

export interface JoinRequestEvent {
  gameId: string;
  requestId: string;
  playerName: string;
}

export interface JoinApprovedEvent {
  playerId: string;
}

export interface JoinRejectedEvent {
  reason: string;
}
