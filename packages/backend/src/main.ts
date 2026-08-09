import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { Server as SocketIOServer } from "socket.io";
import "./infra/middleware/types.js";
import { config } from "./config.js";
import { DatabaseConnection } from "./infra/adapters/persistence/sqlite/database.js";
import { WordRepository } from "./infra/adapters/persistence/sqlite/word.repository.js";
import { CategoryRepository } from "./infra/adapters/persistence/sqlite/category.repository.js";
import { UserRepository } from "./infra/adapters/persistence/sqlite/user.repository.js";
import { RefreshTokenRepository } from "./infra/adapters/persistence/sqlite/refresh-token.repository.js";
import { GameApplicationService } from "./application/services/game.application-service.js";
import { AdminGameService } from "./application/services/admin-game.service.js";
import { SocketGateway } from "./infra/adapters/websocket/socket.gateway.js";
import { GameOrchestrator } from "./application/services/game.orchestrator.js";
import { GameEventHandler } from "./infra/adapters/websocket/game-event.handler.js";
import { registerRoutes } from "./infra/adapters/http/routes.js";
import { registerAuthRoutes } from "./infra/adapters/http/auth-routes.js";
import { registerConcurrentLimiter } from "./infra/middleware/concurrent-limiter.js";
import { CognitoAuthService } from "./infra/adapters/auth/cognito.auth-service.js";
import { createJwtAuthMiddleware } from "./infra/middleware/jwt-auth.middleware.js";
import { createSocketAuthMiddleware } from "./infra/adapters/websocket/socket-auth.middleware.js";

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await fastify.register(cookie, {
  secret: config.cookieSecret,
});

// Register concurrent request limiter
await registerConcurrentLimiter(fastify);

// Initialize database
const db = DatabaseConnection.getInstance(config.databasePath);

// Socket.io setup
const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Dependency injection
const wordRepository = new WordRepository(db);
const categoryRepository = new CategoryRepository(db);
const userRepository = new UserRepository(db);
const refreshTokenRepository = new RefreshTokenRepository(db);
const authService = new CognitoAuthService({
  region: config.cognito.region,
  userPoolId: config.cognito.userPoolId,
  clientId: config.cognito.clientId,
  clientSecret: config.cognito.clientSecret,
  domain: config.cognito.domain,
  callbackUrl: config.cognito.callbackUrl,
  issuer: config.cognito.issuer,
  nodeEnv: config.nodeEnv,
});
const jwtAuthMiddleware = createJwtAuthMiddleware(authService);
const socketAuthMiddleware = createSocketAuthMiddleware(authService);
const gameApplicationService = new GameApplicationService(wordRepository);
const adminGameService = new AdminGameService(
  categoryRepository,
  wordRepository,
);
const socketGateway = new SocketGateway(io);
const gameOrchestrator = new GameOrchestrator(
  gameApplicationService,
  socketGateway,
  wordRepository,
  categoryRepository,
);
const gameEventHandler = new GameEventHandler(
  gameOrchestrator,
  wordRepository,
  socketGateway,
);

// Register HTTP routes
await registerRoutes(
  fastify,
  adminGameService,
  gameApplicationService,
  gameOrchestrator,
  jwtAuthMiddleware,
);
await registerAuthRoutes(
  fastify,
  authService,
  userRepository,
  refreshTokenRepository,
  {
    frontendUrl: config.frontendUrl,
    nodeEnv: config.nodeEnv,
  },
);

// Reject unauthenticated socket connections
io.use(socketAuthMiddleware);

// Socket.io connection handler
io.on("connection", (socket) => {
  gameEventHandler.register(socket);
});

fastify.listen({ port: config.port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running on port ${config.port}`);
});
