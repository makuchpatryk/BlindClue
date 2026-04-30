import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config.js';
import { DatabaseConnection } from './infra/adapters/persistence/sqlite/database.js';
import { WordRepository } from './infra/adapters/persistence/sqlite/word.repository.js';
import { CategoryRepository } from './infra/adapters/persistence/sqlite/category.repository.js';
import { GameApplicationService } from './application/services/game.application-service.js';
import { AdminGameService } from './application/services/admin-game.service.js';
import { SocketGateway } from './infra/adapters/websocket/socket.gateway.js';
import { GameOrchestrator } from './application/services/game.orchestrator.js';
import { GameEventHandler } from './infra/adapters/websocket/game-event.handler.js';
import { registerRoutes } from './infra/adapters/http/routes.js';

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(cors, {
  origin: '*',
  credentials: true,
});

// Initialize database
const db = DatabaseConnection.getInstance(config.databasePath);

// Socket.io setup
const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Dependency injection
const wordRepository = new WordRepository(db);
const categoryRepository = new CategoryRepository(db);
const gameApplicationService = new GameApplicationService(wordRepository);
const adminGameService = new AdminGameService(categoryRepository, wordRepository);
const socketGateway = new SocketGateway(io);
const gameOrchestrator = new GameOrchestrator(gameApplicationService, socketGateway, wordRepository, categoryRepository);
const gameEventHandler = new GameEventHandler(gameOrchestrator, wordRepository, socketGateway);

// Register HTTP routes
await registerRoutes(fastify, adminGameService, gameApplicationService, gameOrchestrator);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  gameEventHandler.register(socket);
});

fastify.listen({ port: config.port, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${config.port}`);
});
