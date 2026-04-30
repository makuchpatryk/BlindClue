import { GameStatus } from '../value-objects/game-status.js';
import { Player } from './player.js';
import { RoundSubmission } from './round-submission.js';
import { Result, ResultError } from '../../../application/utils/result.js';

export class Game {
  private status: GameStatus = GameStatus.LOBBY;
  private currentRound: number = 1;
  private impostorId: string | null = null;
  private players: Map<string, Player> = new Map();
  private descriptions: Map<number, RoundSubmission[]> = new Map();
  private votes: Map<string, string> = new Map();
  private impostorGuess: string | null = null;
  private categoryName: string = '';
  private createdAt: Date;

  constructor(
    private id: string,
    private wordId: string,
    private categoryId: string
  ) {
    this.createdAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  getStatus(): GameStatus {
    return this.status;
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getWordId(): string {
    return this.wordId;
  }

  getCategoryId(): string {
    return this.categoryId;
  }

  getImpostorId(): string | null {
    return this.impostorId;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  addPlayer(player: Player): Result<void, ResultError> {
    if (this.players.size >= 4) {
      return { ok: false, error: new ResultError('GAME_FULL', 'Game is full') };
    }
    if (this.status !== GameStatus.LOBBY) {
      return { ok: false, error: new ResultError('INVALID_STATE', 'Cannot join running game') };
    }
    this.players.set(player.getId().value, player);
    return { ok: true, value: undefined };
  }

  startGame(): Result<void, ResultError> {
    if (this.players.size < 2) {
      return { ok: false, error: new ResultError('NOT_ENOUGH_PLAYERS', 'Need at least 2 players') };
    }
    const playerIds = Array.from(this.players.keys());
    const randomIdx = Math.floor(Math.random() * playerIds.length);
    this.impostorId = playerIds[randomIdx];
    this.status = GameStatus.RUNNING;
    return { ok: true, value: undefined };
  }

  submitDescription(playerId: string, description: string): Result<void, ResultError> {
    if (this.status !== GameStatus.RUNNING) {
      return { ok: false, error: new ResultError('INVALID_STATE', 'Game not running') };
    }
    if (!this.players.has(playerId)) {
      return { ok: false, error: new ResultError('PLAYER_NOT_FOUND', 'Player not in game') };
    }

    if (!this.descriptions.has(this.currentRound)) {
      this.descriptions.set(this.currentRound, []);
    }

    const submission = new RoundSubmission(
      `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      this.id,
      this.currentRound,
      this.players.get(playerId)!.getId(),
      description
    );
    this.descriptions.get(this.currentRound)!.push(submission);

    if (this.allPlayersSubmittedThisRound()) {
      if (this.currentRound < 3) {
        this.currentRound++;
        this.descriptions.set(this.currentRound, []);
      } else {
        this.status = GameStatus.VOTING;
      }
    }

    return { ok: true, value: undefined };
  }

  private allPlayersSubmittedThisRound(): boolean {
    const roundSubs = this.descriptions.get(this.currentRound) ?? [];
    const submittedIds = new Set(roundSubs.map(s => s.getPlayerId().value));
    return submittedIds.size === this.players.size;
  }

  voteImpostor(playerId: string, votedForId: string): Result<void, ResultError> {
    if (this.status !== GameStatus.VOTING) {
      return { ok: false, error: new ResultError('NOT_VOTING', 'Not in voting phase') };
    }
    if (!this.players.has(playerId) || !this.players.has(votedForId)) {
      return { ok: false, error: new ResultError('INVALID_PLAYER', 'Invalid player') };
    }
    if (this.votes.has(playerId)) {
      return { ok: false, error: new ResultError('ALREADY_VOTED', 'Player already voted') };
    }

    this.votes.set(playerId, votedForId);

    if (this.votes.size === this.players.size) {
      this.status = GameStatus.ENDED;
    }

    return { ok: true, value: undefined };
  }

  getVoteResults(): Map<string, number> {
    const voteMap = new Map<string, number>();
    this.votes.forEach(votedForId => {
      voteMap.set(votedForId, (voteMap.get(votedForId) ?? 0) + 1);
    });
    return voteMap;
  }

  getMostVoted(): string | null {
    const voteMap = this.getVoteResults();
    if (voteMap.size === 0) return null;
    return Array.from(voteMap.entries()).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }

  getDescriptions(round?: number): RoundSubmission[] {
    if (round !== undefined) {
      return this.descriptions.get(round) ?? [];
    }
    return Array.from(this.descriptions.values()).flat();
  }

  guessWord(guess: string, word: string): Result<boolean, ResultError> {
    if (this.status !== GameStatus.ENDED) {
      return { ok: false, error: new ResultError('INVALID_STATE', 'Cannot guess now') };
    }
    this.impostorGuess = guess;
    const isCorrect = guess.toLowerCase() === word.toLowerCase();
    return { ok: true, value: isCorrect };
  }

  getImpostorGuess(): string | null {
    return this.impostorGuess;
  }

  setCategoryName(name: string): void {
    this.categoryName = name;
  }

  getCategoryName(): string {
    return this.categoryName;
  }
}
