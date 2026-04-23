# Impostor - Multiplayer Word Guessing Game

A real-time multiplayer game where one player is the impostor who doesn't know the target word and must figure it out while others give clues.

## Tech Stack

- **Backend**: Fastify + Socket.io + SQLite + TypeScript
- **Frontend**: Vue 3 + Vite + Pinia + Tailwind CSS
- **Monorepo**: pnpm workspaces with Clean Architecture patterns

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Start both backend and frontend in development mode
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Development Servers

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **API Health**: http://localhost:3000/health

## Project Structure

```
impostor/
├── packages/
│   ├── backend/        # Fastify + Socket.io + SQLite
│   ├── frontend/       # Vue 3 + Vite
│   └── shared/         # Shared types (if needed)
├── specs/
│   ├── todos/          # In-progress tasks
│   └── completed/      # Completed tasks
└── plan/               # Project planning documents
```

## Game Rules

1. **Lobby**: 2-4 players join a game
2. **Rounds**: 3 rounds where non-impostor players give descriptions of the word
3. **Voting**: Players vote on who they think is the impostor
4. **Reveal**: Votes are revealed, and if caught, the impostor gets to guess the word
5. **Scoring**:
   - Impostor not caught: +2 points
   - Others if not impostor: +1 point each
   - Impostor caught, voted correctly: +2 points to voters
   - Impostor caught, guessed correctly: +1 to impostor

## API Endpoints

### Health
- `GET /health` - Server health check

### Games
- `POST /games` - Create a new game
- `GET /games/:gameId` - Get game state

### Admin (Categories & Words)
- `POST /admin/categories` - Create category
- `GET /admin/categories` - List all categories
- `DELETE /admin/categories/:id` - Delete category
- `POST /admin/words` - Add word to category
- `DELETE /admin/words/:id` - Delete word

## WebSocket Events

### Client → Server
- `joinGame` - Join a game
- `startGame` - Start the game
- `submitDescription` - Submit a description
- `voteImpostor` - Vote for impostor
- `guessWord` - Guess the word (impostor only)

### Server → Client
- `GameStarted` - Game has started
- `RoundSubmitted` - Round descriptions submitted
- `VotingStarted` - Voting phase started
- `VotesRevealed` - Vote results revealed
- `GameEnded` - Game finished with final scores

## Deployment

### Docker
```bash
# Build image
docker build -f packages/backend/Dockerfile -t impostor-backend .

# Run container
docker run -p 3000:3000 -e DATABASE_PATH=/data/impostor.db impostor-backend
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `NODE_ENV` - Development or production
- `PORT` - Server port
- `DATABASE_PATH` - SQLite database path

## Testing

### Run Backend Tests
```bash
pnpm test --filter @impostor/backend
```

### Run All Tests
```bash
pnpm test
```

Tests include:
- Game lifecycle (create, join, start, voting, end)
- Scoring logic (impostor caught/not caught scenarios)
- Repository integration tests

## Development Workflow

1. Tasks are tracked in `specs/todos/` and `specs/completed/`
2. Create a new task: `specs/todos/task-name.md`
3. Move to completed when done: `mv specs/todos/task-name.md specs/completed/`
4. Reference main plan: `plan/GAME_PLAN_FINAL.md`

## Useful pnpm Commands

```bash
# Install workspace dependencies
pnpm install

# Run script in all packages
pnpm -r run <script>

# Run script in specific package
pnpm --filter @impostor/backend run <script>

# Add dependency to specific package
pnpm --filter @impostor/backend add lodash

# Remove dependency from package
pnpm --filter @impostor/frontend remove tailwindcss
```

## Architecture Decisions

- **In-Memory Games**: Games stored in GameManager, deleted after completion
- **Clean Architecture**: Domain entities, use-cases, application services, adapters
- **Result Pattern**: All operations return `Result<T, Error>` for explicit error handling
- **Package Manager**: pnpm workspaces for better monorepo management and faster installs

---

Built with ❤️ | [View Main Plan](plan/GAME_PLAN_FINAL.md)
