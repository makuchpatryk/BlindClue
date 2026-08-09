# Multiplayer Game Architecture Plan (Finalized)

## 1. Project Overview

**Game Concept**: "Impostor" word-guessing game for 2-4 players

- One player is the impostor (doesn't know the target word, only category hint)
- Other players know the word and submit descriptions
- 3 rounds of descriptions, then voting to identify the impostor
- Impostor attempts to guess the word after being accused

**Tech Stack**

- Backend: Fastify + SQLite + Socket.io
- Frontend: Vue 3 + Vite (feature-based, modular)
- Architecture: Clean Architecture with Adapter/Repository pattern

**Key Decisions** (from grilling session)

- Games: **in-memory only** (GameManager singleton), deleted after completion
- Static data (categories/words): **SQLite + dynamic admin API**
- Service layers: **GameApplicationService** (gameplay) + **AdminGameService** (CRUD) separate
- Validation: **backend-only** (Result<T, Error> pattern)
- Game entity: **rich domain model** with all business logic
- State mutations: **in-place mutations** in Game entity
- Event flow: **use-case → Game mutation → GameOrchestrator broadcasts**
- Round progression: **auto-advance when all players submit**
- Voting: **auto-reveal + impostor guess when all vote**
- Testing: **integration tests** with real Game instances, mocked external deps
- Naming: **kebab-case files**, **PascalCase classes/types**, **PascalCase events**

---

## 2. Monorepo Structure

The project is organized as a **monorepo** using npm/yarn workspaces for unified development and deployment:

```
impostor/
├── packages/
│   ├── backend/          # Fastify + Socket.io + SQLite
│   ├── frontend/         # Vue 3 + Vite
│   └── shared/           # Shared types and constants (optional)
├── package.json          # root workspace config
├── tsconfig.json         # shared TypeScript config
└── .gitignore
```

**Workspace Benefits:**

- Single source of truth for shared types (if using `packages/shared`)
- Unified dev/build/test scripts runnable from root (`npm run dev`, `npm run build`)
- Easier dependency management across packages
- Simplified deployment (build once, deploy both packages)

**Root package.json** includes:

```json
{
  "workspaces": ["packages/backend", "packages/frontend"],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

---

## 3. Backend Architecture

### 2.1 Directory Structure

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── game.ts                    (Game class)
│   │   │   │   ├── player.ts                  (Player class)
│   │   │   │   ├── word.ts                    (Word class)
│   │   │   │   ├── vote.ts                    (Vote class)
│   │   │   │   └── round-submission.ts        (RoundSubmission class)
│   │   │   ├── value-objects/
│   │   │   │   ├── game-status.ts             (enum: LOBBY, RUNNING, VOTING, ENDED)
│   │   │   │   ├── score.ts                   (Score value object)
│   │   │   │   ├── player-id.ts               (PlayerId value object)
│   │   │   │   └── game-id.ts                 (GameId value object)
│   │   │   ├── use-cases/
│   │   │   │   ├── create-game.use-case.ts
│   │   │   │   ├── join-game.use-case.ts
│   │   │   │   ├── submit-description.use-case.ts
│   │   │   │   ├── vote-impostor.use-case.ts
│   │   │   │   ├── guess-word.use-case.ts
│   │   │   │   ├── calculate-scores.use-case.ts
│   │   │   │   └── get-game-state.use-case.ts
│   │   │   └── ports/
│   │   │       ├── word.repository.ts         (interface)
│   │   │       ├── category.repository.ts     (interface)
│   │   │       └── exceptions/
│   │   │           ├── game-not-found.exception.ts
│   │   │           ├── game-full.exception.ts
│   │   │           ├── invalid-game-state.exception.ts
│   │   │           └── domain.exception.ts
│   ├── infra/
│   │   ├── adapters/
│   │   │   ├── persistence/
│   │   │   │   ├── sqlite/
│   │   │   │   │   ├── database.ts            (SQLite connection)
│   │   │   │   │   ├── word.repository.ts     (implementation)
│   │   │   │   │   └── category.repository.ts (implementation)
│   │   │   │   └── migrations/
│   │   │   │       └── init.sql
│   │   │   ├── http/
│   │   │   │   ├── routes.ts                  (Fastify routes)
│   │   │   │   └── http-exception-filter.ts   (error handling)
│   │   │   └── websocket/
│   │   │       ├── socket.gateway.ts          (Socket.io gateway)
│   │   │       ├── game-event.handler.ts      (event handlers)
│   │   │       └── events.ts                  (event types)
│   │   └── database/
│   │       ├── schema.sql
│   │       └── seeds.sql
│   ├── application/
│   │   ├── dtos/
│   │   │   ├── create-game.dto.ts
│   │   │   ├── game-state.dto.ts
│   │   │   ├── player.dto.ts
│   │   │   ├── round-submission.dto.ts
│   │   │   └── vote-result.dto.ts
│   │   ├── services/
│   │   │   ├── game.application-service.ts    (orchestrates use-cases)
│   │   │   ├── admin-game.service.ts          (word/category CRUD)
│   │   │   ├── game-manager.ts                (in-memory store)
│   │   │   └── game.orchestrator.ts           (coordinates service + gateway)
│   │   ├── mappers/
│   │   │   ├── game.mapper.ts
│   │   │   └── player.mapper.ts
│   │   └── utils/
│   │       ├── result.ts                      (Result<T, E> type)
│   │       └── id-generator.ts
│   ├── main.ts
│   ├── config.ts
│   └── types.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── .env.example
```

### 2.2 Data Model (SQLite)

```sql
-- Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Words
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  word TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes
CREATE INDEX idx_words_category_id ON words(category_id);
```

**Note**: Games, Players, Votes, Submissions are **in-memory only** in GameManager. No DB persistence.

### 2.3 Core Types & Result Pattern

**result.ts**

```typescript
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export class ResultError {
  constructor(
    readonly code: string,
    readonly message: string,
  ) {}
}
```

**game-status.ts**

```typescript
export enum GameStatus {
  LOBBY = "LOBBY",
  RUNNING = "RUNNING",
  VOTING = "VOTING",
  ENDED = "ENDED",
}
```

### 2.4 Core Domain Entities

**game.ts**

```typescript
export class Game {
  private id: string;
  private status: GameStatus = GameStatus.LOBBY;
  private currentRound: number = 1;
  private wordId: string;
  private impostorId: string | null = null;
  private players: Map<string, Player> = new Map();
  private descriptions: Map<number, RoundSubmission[]> = new Map();
  private votes: Map<string, string> = new Map(); // voterId -> votedForId
  private impostorGuess: string | null = null;
  private createdAt: Date;

  constructor(id: string, wordId: string) {
    this.id = id;
    this.wordId = wordId;
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
  getImpostorId(): string | null {
    return this.impostorId;
  }
  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  addPlayer(player: Player): Result<void, ResultError> {
    if (this.players.size >= 4) {
      return { ok: false, error: new ResultError("GAME_FULL", "Game is full") };
    }
    if (this.status !== GameStatus.LOBBY) {
      return {
        ok: false,
        error: new ResultError("INVALID_STATE", "Cannot join running game"),
      };
    }
    this.players.set(player.getId(), player);
    return { ok: true, value: undefined };
  }

  startGame(): Result<void, ResultError> {
    if (this.players.size < 2) {
      return {
        ok: false,
        error: new ResultError("NOT_ENOUGH_PLAYERS", "Need at least 2 players"),
      };
    }
    const playerIds = Array.from(this.players.keys());
    const randomIdx = Math.floor(Math.random() * playerIds.length);
    this.impostorId = playerIds[randomIdx];
    this.status = GameStatus.RUNNING;
    return { ok: true, value: undefined };
  }

  submitDescription(
    playerId: string,
    description: string,
  ): Result<void, ResultError> {
    if (this.status !== GameStatus.RUNNING) {
      return {
        ok: false,
        error: new ResultError("INVALID_STATE", "Game not running"),
      };
    }
    if (!this.players.has(playerId)) {
      return {
        ok: false,
        error: new ResultError("PLAYER_NOT_FOUND", "Player not in game"),
      };
    }
    if (
      playerId === this.impostorId &&
      this.currentRound === 1 &&
      this.descriptions.get(1)?.length === 0
    ) {
      return {
        ok: false,
        error: new ResultError(
          "IMPOSTOR_CANNOT_SUBMIT_FIRST",
          "Impostor must wait",
        ),
      };
    }

    if (!this.descriptions.has(this.currentRound)) {
      this.descriptions.set(this.currentRound, []);
    }

    const submission = new RoundSubmission(
      `sub_${Date.now()}`,
      this.id,
      this.currentRound,
      playerId,
      description,
    );
    this.descriptions.get(this.currentRound)!.push(submission);

    // Check if all players submitted
    if (this.allPlayersSubmittedThisRound()) {
      if (this.currentRound < 3) {
        this.currentRound++;
        this.descriptions.set(this.currentRound, []);
      } else {
        // Move to voting
        this.status = GameStatus.VOTING;
      }
    }

    return { ok: true, value: undefined };
  }

  private allPlayersSubmittedThisRound(): boolean {
    const roundSubs = this.descriptions.get(this.currentRound) ?? [];
    const submittedIds = new Set(roundSubs.map((s) => s.getPlayerId()));
    return submittedIds.size === this.players.size;
  }

  voteImpostor(
    playerId: string,
    votedForId: string,
  ): Result<void, ResultError> {
    if (this.status !== GameStatus.VOTING) {
      return {
        ok: false,
        error: new ResultError("NOT_VOTING", "Not in voting phase"),
      };
    }
    if (!this.players.has(playerId) || !this.players.has(votedForId)) {
      return {
        ok: false,
        error: new ResultError("INVALID_PLAYER", "Invalid player"),
      };
    }
    if (this.votes.has(playerId)) {
      return {
        ok: false,
        error: new ResultError("ALREADY_VOTED", "Player already voted"),
      };
    }

    this.votes.set(playerId, votedForId);

    // Check if all voted
    if (this.votes.size === this.players.size) {
      this.status = GameStatus.ENDED;
    }

    return { ok: true, value: undefined };
  }

  getVoteResults(): Map<string, number> {
    const voteMap = new Map<string, number>();
    this.votes.forEach((votedForId) => {
      voteMap.set(votedForId, (voteMap.get(votedForId) ?? 0) + 1);
    });
    return voteMap;
  }

  getMostVoted(): string | null {
    const voteMap = this.getVoteResults();
    if (voteMap.size === 0) return null;
    return Array.from(voteMap.entries()).reduce((a, b) =>
      b[1] > a[1] ? b : a,
    )[0];
  }

  guessWord(guess: string): Result<boolean, ResultError> {
    if (this.status !== GameStatus.ENDED) {
      return {
        ok: false,
        error: new ResultError("INVALID_STATE", "Cannot guess now"),
      };
    }
    this.impostorGuess = guess;
    const isCorrect = guess.toLowerCase() === this.getWord().toLowerCase();
    return { ok: true, value: isCorrect };
  }

  getWord(): string {
    // This would be fetched from WordRepository in use-case
    return ""; // placeholder
  }
}
```

**player.ts**

```typescript
export class Player {
  private id: string;
  private gameId: string;
  private name: string;
  private isImpostor: boolean = false;
  private score: number = 0;

  constructor(id: string, gameId: string, name: string) {
    this.id = id;
    this.gameId = gameId;
    this.name = name;
  }

  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getGameId(): string {
    return this.gameId;
  }
  isTheImpostor(): boolean {
    return this.isImpostor;
  }
  getScore(): number {
    return this.score;
  }

  setImpostor(): void {
    this.isImpostor = true;
  }

  addScore(points: number): void {
    this.score += points;
  }
}
```

### 2.5 Repository Interfaces (Ports)

**word.repository.ts**

```typescript
export interface IWordRepository {
  getRandomWord(categoryId?: string): Promise<Result<Word, ResultError>>;
  findById(id: string): Promise<Result<Word, ResultError>>;
  save(word: Word): Promise<Result<void, ResultError>>;
  delete(id: string): Promise<Result<void, ResultError>>;
}
```

**category.repository.ts**

```typescript
export interface ICategoryRepository {
  getAll(): Promise<Result<Category[], ResultError>>;
  findById(id: string): Promise<Result<Category, ResultError>>;
  save(category: Category): Promise<Result<void, ResultError>>;
  delete(id: string): Promise<Result<void, ResultError>>;
}
```

### 2.6 GameManager (In-Memory Store)

**game-manager.ts**

```typescript
export class GameManager {
  private games: Map<string, Game> = new Map();

  createGame(gameId: string, game: Game): void {
    this.games.set(gameId, game);
  }

  getGame(gameId: string): Game | null {
    return this.games.get(gameId) ?? null;
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }

  exists(gameId: string): boolean {
    return this.games.has(gameId);
  }
}
```

### 2.7 Use Cases (Examples)

**create-game.use-case.ts**

```typescript
export class CreateGameUseCase {
  constructor(
    private gameManager: GameManager,
    private wordRepository: IWordRepository,
  ) {}

  async execute(): Promise<Result<string, ResultError>> {
    const wordResult = await this.wordRepository.getRandomWord();
    if (!wordResult.ok) {
      return wordResult;
    }

    const gameId = `game_${Date.now()}`;
    const game = new Game(gameId, wordResult.value.getId());
    this.gameManager.createGame(gameId, game);

    return { ok: true, value: gameId };
  }
}
```

**submit-description.use-case.ts**

```typescript
export class SubmitDescriptionUseCase {
  constructor(private gameManager: GameManager) {}

  async execute(
    gameId: string,
    playerId: string,
    description: string,
  ): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    const result = game.submitDescription(playerId, description);
    return result;
  }
}
```

**vote-impostor.use-case.ts**

```typescript
export class VoteImpostorUseCase {
  constructor(private gameManager: GameManager) {}

  async execute(
    gameId: string,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    return game.voteImpostor(playerId, votedForId);
  }
}
```

**calculate-scores.use-case.ts**

```typescript
export class CalculateScoresUseCase {
  execute(game: Game): Map<string, number> {
    const scores = new Map<string, number>();
    const impostorId = game.getImpostorId();
    const voteMap = game.getVoteResults();
    const impostorVotes = voteMap.get(impostorId!) ?? 0;

    const allPlayers = game.getPlayers();

    if (impostorVotes === 0) {
      // Impostor not caught: +2 points
      scores.set(impostorId!, 2);
      allPlayers.forEach((p) => {
        if (p.getId() !== impostorId) {
          scores.set(p.getId(), 1); // Others: +1
        }
      });
    } else {
      // Impostor caught: voters get +2, non-voters get +0
      allPlayers.forEach((p) => {
        const votes = voteMap.get(p.getId()) ?? 0;
        if (votes > 0) {
          scores.set(p.getId(), 2);
        }
      });
      // Impostor: +1 if guess correct (handled separately)
      scores.set(impostorId!, 1);
    }

    return scores;
  }
}
```

### 2.8 GameOrchestrator

**game.orchestrator.ts**

```typescript
export class GameOrchestrator {
  constructor(
    private gameApplicationService: GameApplicationService,
    private gameManager: GameManager,
    private socketGateway: SocketGateway,
  ) {}

  async createGame(): Promise<Result<string, ResultError>> {
    const result = await this.gameApplicationService.createGame();
    if (result.ok) {
      this.socketGateway.broadcastGameCreated(result.value);
    }
    return result;
  }

  async submitDescription(
    gameId: string,
    playerId: string,
    description: string,
  ): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.submitDescription(
      gameId,
      playerId,
      description,
    );

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game) {
        this.socketGateway.broadcastRoundSubmitted(
          gameId,
          game.getCurrentRound(),
        );

        // Check if round advanced
        if (game.getStatus() === GameStatus.VOTING) {
          this.socketGateway.broadcastVotingStarted(gameId);
        }
      }
    }

    return result;
  }

  async voteImpostor(
    gameId: string,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    const result = await this.gameApplicationService.voteImpostor(
      gameId,
      playerId,
      votedForId,
    );

    if (result.ok) {
      const game = this.gameManager.getGame(gameId);
      if (game && game.getStatus() === GameStatus.ENDED) {
        const voteResults = game.getVoteResults();
        this.socketGateway.broadcastVotesRevealed(
          gameId,
          voteResults,
          game.getMostVoted(),
        );
      }
    }

    return result;
  }
}
```

### 2.9 Application Service

**game.application-service.ts**

```typescript
export class GameApplicationService {
  constructor(
    private gameManager: GameManager,
    private wordRepository: IWordRepository,
    private createGameUseCase: CreateGameUseCase,
    private submitDescriptionUseCase: SubmitDescriptionUseCase,
    private voteImpostorUseCase: VoteImpostorUseCase,
    private guessWordUseCase: GuessWordUseCase,
    private calculateScoresUseCase: CalculateScoresUseCase,
  ) {}

  async createGame(): Promise<Result<string, ResultError>> {
    return this.createGameUseCase.execute();
  }

  async joinGame(
    gameId: string,
    playerName: string,
  ): Promise<Result<string, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }

    const playerId = `player_${Date.now()}`;
    const player = new Player(playerId, gameId, playerName);
    const result = game.addPlayer(player);

    if (result.ok) {
      return { ok: true, value: playerId };
    }
    return result;
  }

  async startGame(gameId: string): Promise<Result<void, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return game.startGame();
  }

  async submitDescription(
    gameId: string,
    playerId: string,
    description: string,
  ): Promise<Result<void, ResultError>> {
    return this.submitDescriptionUseCase.execute(gameId, playerId, description);
  }

  async voteImpostor(
    gameId: string,
    playerId: string,
    votedForId: string,
  ): Promise<Result<void, ResultError>> {
    return this.voteImpostorUseCase.execute(gameId, playerId, votedForId);
  }

  async guessWord(
    gameId: string,
    guess: string,
  ): Promise<Result<boolean, ResultError>> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    return game.guessWord(guess);
  }

  calculateScores(gameId: string): Result<Map<string, number>, ResultError> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    const scores = this.calculateScoresUseCase.execute(game);
    return { ok: true, value: scores };
  }

  getGameState(gameId: string): Result<GameStateDTO, ResultError> {
    const game = this.gameManager.getGame(gameId);
    if (!game) {
      return {
        ok: false,
        error: new ResultError("GAME_NOT_FOUND", "Game not found"),
      };
    }
    // Map to DTO
    return { ok: true, value: {} as GameStateDTO };
  }
}
```

### 2.10 WebSocket Events

**Event Types** (PascalCase)

```typescript
export interface RoundSubmittedEvent {
  gameId: string;
  round: number;
  descriptions: DescriptionDTO[];
}

export interface VotingStartedEvent {
  gameId: string;
}

export interface VotesRevealedEvent {
  gameId: string;
  voteMap: Map<string, number>;
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
  scores: ScoreDTO[];
}
```

**socket.gateway.ts**

```typescript
export class SocketGateway {
  constructor(private io: Server) {}

  broadcastRoundSubmitted(gameId: string, round: number): void {
    this.io.to(gameId).emit("RoundSubmitted", { gameId, round });
  }

  broadcastVotingStarted(gameId: string): void {
    this.io.to(gameId).emit("VotingStarted", { gameId });
  }

  broadcastVotesRevealed(
    gameId: string,
    voteMap: Map<string, number>,
    mostVoted: string,
  ): void {
    this.io.to(gameId).emit("VotesRevealed", { gameId, voteMap, mostVoted });
  }

  broadcastGameEnded(gameId: string, scores: ScoreDTO[]): void {
    this.io.to(gameId).emit("GameEnded", { gameId, scores });
  }
}
```

---

## 3. Frontend Architecture

### 3.1 Directory Structure

```
frontend/
├── src/
│   ├── features/
│   │   ├── lobby/
│   │   │   ├── components/
│   │   │   │   ├── join-game-form.vue
│   │   │   │   ├── create-game-form.vue
│   │   │   │   └── lobby-waiting-room.vue
│   │   │   ├── composables/
│   │   │   │   └── use-lobby.ts
│   │   │   ├── stores/
│   │   │   │   └── lobby.store.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── game/
│   │   │   ├── components/
│   │   │   │   ├── round-phase.vue
│   │   │   │   ├── description-submit.vue
│   │   │   │   ├── description-display.vue
│   │   │   │   ├── voting-phase.vue
│   │   │   │   ├── reveal-phase.vue
│   │   │   │   └── impostor-guess-phase.vue
│   │   │   ├── composables/
│   │   │   │   ├── use-game-state.ts
│   │   │   │   ├── use-game-flow.ts
│   │   │   │   └── use-round-timer.ts
│   │   │   ├── stores/
│   │   │   │   └── game.store.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── manage-categories.vue
│   │   │   │   └── manage-words.vue
│   │   │   ├── composables/
│   │   │   │   └── use-admin-service.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── scoreboard/
│   │   │   ├── components/
│   │   │   │   ├── final-scoreboard.vue
│   │   │   │   └── player-card.vue
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── modal.vue
│   │       │   ├── button.vue
│   │       │   ├── timer.vue
│   │       │   └── game-code.vue
│   │       ├── composables/
│   │       │   ├── use-socket.ts
│   │       │   ├── use-timer.ts
│   │       │   └── use-copy-clipboard.ts
│   │       ├── services/
│   │       │   └── game-client.service.ts   (main orchestrator)
│   │       ├── utils/
│   │       │   ├── socket.ts
│   │       │   └── constants.ts
│   │       ├── types/
│   │       │   ├── game.ts
│   │       │   └── events.ts
│   │       └── styles/
│   │           └── index.css
│   ├── App.vue
│   ├── main.ts
│   ├── router.ts
│   └── env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### 3.2 GameClientService (Frontend Orchestrator)

**game-client.service.ts**

```typescript
export class GameClientService {
  private static instance: GameClientService;
  private socket: Socket | null = null;
  private gameStore: GameStore;

  private constructor(socket: Socket) {
    this.socket = socket;
    this.gameStore = useGameStore();
    this.setupSocketListeners();
  }

  static getInstance(socket: Socket): GameClientService {
    if (!GameClientService.instance) {
      GameClientService.instance = new GameClientService(socket);
    }
    return GameClientService.instance;
  }

  private setupSocketListeners(): void {
    this.socket?.on("GameStarted", (data) => {
      this.gameStore.setGameStarted(data);
    });

    this.socket?.on("RoundSubmitted", (data) => {
      this.gameStore.addRoundSubmissions(data.round, data.descriptions);
    });

    this.socket?.on("VotingStarted", (data) => {
      this.gameStore.setStatus("VOTING");
    });

    this.socket?.on("VotesRevealed", (data) => {
      this.gameStore.setVotes(data.voteMap, data.mostVoted);
    });

    this.socket?.on("GameEnded", (data) => {
      this.gameStore.setStatus("ENDED");
      this.gameStore.setFinalScores(data.scores);
    });
  }

  submitDescription(description: string): void {
    this.socket?.emit("submitDescription", { description });
  }

  voteImpostor(playerId: string): void {
    this.socket?.emit("voteImpostor", { playerId });
  }

  guessWord(word: string): void {
    this.socket?.emit("guessWord", { word });
  }
}
```

### 3.3 Pinia Store

**game.store.ts**

```typescript
export const useGameStore = defineStore("game", () => {
  const gameId = ref<string>("");
  const status = ref<"LOBBY" | "RUNNING" | "VOTING" | "ENDED">("LOBBY");
  const currentRound = ref<number>(1);
  const word = ref<string>("");
  const category = ref<string>("");
  const isImpostor = ref<boolean>(false);
  const players = ref<PlayerDTO[]>([]);
  const descriptions = ref<Map<number, DescriptionDTO[]>>(new Map());
  const votes = ref<Map<string, number> | null>(null);
  const mostVoted = ref<string | null>(null);
  const finalScores = ref<ScoreDTO[]>([]);

  const setGameStarted = (data: any) => {
    gameId.value = data.gameId;
    status.value = "RUNNING";
    word.value = data.word ?? "";
    category.value = data.category;
    isImpostor.value = data.isImpostor;
    players.value = data.players;
  };

  const setStatus = (newStatus: string) => {
    status.value = newStatus as any;
  };

  const addRoundSubmissions = (round: number, descs: DescriptionDTO[]) => {
    descriptions.value.set(round, descs);
  };

  const setVotes = (voteMap: Map<string, number>, mostVotedId: string) => {
    votes.value = voteMap;
    mostVoted.value = mostVotedId;
  };

  const setFinalScores = (scores: ScoreDTO[]) => {
    finalScores.value = scores;
  };

  const reset = () => {
    gameId.value = "";
    status.value = "LOBBY";
    currentRound.value = 1;
    word.value = "";
    category.value = "";
    isImpostor.value = false;
    players.value = [];
    descriptions.value.clear();
    votes.value = null;
    mostVoted.value = null;
    finalScores.value = [];
  };

  return {
    gameId,
    status,
    currentRound,
    word,
    category,
    isImpostor,
    players,
    descriptions,
    votes,
    mostVoted,
    finalScores,
    setGameStarted,
    setStatus,
    addRoundSubmissions,
    setVotes,
    setFinalScores,
    reset,
  };
});
```

### 3.4 Composables

**use-game-state.ts**

```typescript
export function useGameState() {
  const gameStore = useGameStore();
  const gameClientService = inject<GameClientService>("gameClientService");

  const submitDescription = (description: string) => {
    gameClientService?.submitDescription(description);
  };

  const voteImpostor = (playerId: string) => {
    gameClientService?.voteImpostor(playerId);
  };

  const guessWord = (word: string) => {
    gameClientService?.guessWord(word);
  };

  return {
    // Getters from store
    currentRound: computed(() => gameStore.currentRound),
    status: computed(() => gameStore.status),
    players: computed(() => gameStore.players),
    isImpostor: computed(() => gameStore.isImpostor),
    word: computed(() => gameStore.word),
    category: computed(() => gameStore.category),
    descriptions: computed(() => gameStore.descriptions),
    // Actions
    submitDescription,
    voteImpostor,
    guessWord,
  };
}
```

---

## 4. Naming Conventions (Locked)

- **Files**: kebab-case
  - `game.service.ts`
  - `game-manager.ts`
  - `submit-description.use-case.ts`
  - `round-submitted.event.ts`

- **Classes/Types/Interfaces**: PascalCase
  - `GameService`
  - `SubmitDescriptionUseCase`
  - `Game`
  - `Player`
  - `ResultError`

- **Events**: PascalCase (properties + event names)
  - `RoundSubmittedEvent`
  - `VotingStartedEvent`
  - `GameEndedEvent`

- **Enums**: PascalCase
  - `GameStatus`
  - `ErrorCode`

---

## 5. Scoring Logic (Finalized)

```
After 3 rounds, voting phase:

IMPOSTOR NOT CAUGHT (votes for impostor = 0):
  - Impostor: +2 points
  - Non-impostors: +1 point each

IMPOSTOR CAUGHT (votes for impostor > 0):
  - Players who voted for impostor: +2 points each
  - Players who didn't vote for impostor: +0 points
  - Impostor: +1 point (if guesses word correctly)
```

---

## 6. Game State Transitions

```
┌─────────┐
│ LOBBY   │  (Create game, players join)
│         │
├─────────┤
│ RUNNING │  (3 rounds of submissions, auto-advance when all submit)
│         │
├─────────┤
│ VOTING  │  (Hidden voting, auto-reveal when all vote)
│         │
├─────────┤
│ ENDED   │  (Impostor guess, scores calculated, cleanup)
└─────────┘
```

---

## 7. WebSocket Flow (Complete)

```
CLIENT → SERVER

joinGame(gameId, playerName)
  → GameApplicationService.joinGame()
  → Game.addPlayer()
  → ✓ GameOrchestrator broadcasts PlayerJoined to room

startGame()
  → GameApplicationService.startGame()
  → Game.startGame() (assign impostor, set word/category)
  → ✓ GameOrchestrator broadcasts GameStarted

submitDescription(description)
  → SubmitDescriptionUseCase.execute()
  → Game.submitDescription()
  → Check allPlayersSubmittedThisRound()
    ├─ NO: broadcast RoundSubmitted (current submissions)
    └─ YES (round 3): set status = VOTING, broadcast VotingStarted

voteImpostor(playerId)
  → VoteImpostorUseCase.execute()
  → Game.voteImpostor()
  → Check if allVoted()
    ├─ NO: broadcast vote received (no details)
    └─ YES: set status = ENDED, broadcast VotesRevealed

guessWord(word)
  → GuessWordUseCase.execute()
  → Game.guessWord()
  → ✓ broadcast GuessResult (isCorrect, word)
  → CalculateScoresUseCase.execute()
  → ✓ broadcast GameEnded (final scores)
  → GameManager.deleteGame() (cleanup)
```

---

## 8. Development Timeline

**Phase 1: Backend Setup** (Days 1-2)

- Fastify + Socket.io setup
- SQLite schema + migrations
- Core entities (Game, Player, Word, Category)
- Result<T, E> type

**Phase 2: Backend Use Cases & Services** (Days 2-3)

- All use-cases
- GameApplicationService + AdminGameService
- GameManager
- GameOrchestrator

**Phase 3: Backend Repositories & Adapters** (Day 3)

- SQLite adapters (WordRepository, CategoryRepository)
- HTTP routes (admin CRUD)
- SocketGateway setup

**Phase 4: Frontend Setup & Lobby** (Days 3-4)

- Vue 3 + Vite + Tailwind
- Router
- Lobby feature (join/create)
- Pinia stores

**Phase 5: Frontend Game Flow** (Days 4-5)

- RoundPhase, VotingPhase, RevealPhase
- GameClientService setup
- Socket subscriptions
- Real-time UI updates

**Phase 6: Polish & Testing** (Days 5-6)

- Integration tests (backend)
- E2E tests
- Bug fixes
- Deployment

---

## 9. Type Definitions (Shared)

```typescript
// DTO
export interface GameStateDTO {
  id: string;
  status: "LOBBY" | "RUNNING" | "VOTING" | "ENDED";
  currentRound: number;
  word?: string; // Only for non-impostor
  category: string;
  impostorId?: string; // Only after voting starts
  players: PlayerDTO[];
}

export interface PlayerDTO {
  id: string;
  name: string;
  score: number;
}

export interface DescriptionDTO {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  round: number;
}

export interface ScoreDTO {
  playerId: string;
  playerName: string;
  score: number;
}
```

---

## 10. Next Steps

Ready to start building:

1. **Backend project setup** (Fastify + TypeScript)
2. **Core domain entities**
3. **Repository implementations**
4. **Use-cases**
5. **Application services**
6. **WebSocket gateway**
7. **HTTP routes**
8. **Frontend initialization**

Which should we start with?

## 11. Related Plans

- **Auth (Cognito)**: `specs/todos/cognito-auth-implementation.md` — adds user accounts on top of this anonymous-play architecture. Not yet built; touches WebSocket gateway (§2.10, §3.1) and game creation flow (§2.8) once implemented.
