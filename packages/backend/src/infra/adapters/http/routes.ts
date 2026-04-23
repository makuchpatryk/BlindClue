import { FastifyInstance } from 'fastify';
import { AdminGameService } from '../../../application/services/admin-game.service.js';
import { GameApplicationService } from '../../../application/services/game.application-service.js';
import { GameOrchestrator } from '../../../application/services/game.orchestrator.js';

export async function registerRoutes(
  fastify: FastifyInstance,
  adminGameService: AdminGameService,
  gameApplicationService: GameApplicationService,
  gameOrchestrator: GameOrchestrator
) {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Category routes
  fastify.post<{ Body: { name: string } }>('/admin/categories', async (request, reply) => {
    const { name } = request.body;
    const result = await adminGameService.createCategory(name);
    if (result.ok) {
      return reply.send({ categoryId: result.value });
    }
    return reply.status(400).send(result.error);
  });

  fastify.get('/admin/categories', async () => {
    const result = await adminGameService.getCategories();
    if (result.ok) {
      return result.value;
    }
    return { error: result.error };
  });

  fastify.delete<{ Params: { id: string } }>('/admin/categories/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await adminGameService.deleteCategory(id);
    if (result.ok) {
      return reply.send({ success: true });
    }
    return reply.status(400).send(result.error);
  });

  // Word routes
  fastify.post<{ Body: { categoryId: string; word: string } }>('/admin/words', async (request, reply) => {
    const { categoryId, word } = request.body;
    const result = await adminGameService.addWord(categoryId, word);
    if (result.ok) {
      return reply.send({ wordId: result.value });
    }
    return reply.status(400).send(result.error);
  });

  fastify.delete<{ Params: { id: string } }>('/admin/words/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await adminGameService.deleteWord(id);
    if (result.ok) {
      return reply.send({ success: true });
    }
    return reply.status(400).send(result.error);
  });

  // Game routes
  fastify.post('/games', async (request, reply) => {
    const result = await gameOrchestrator.createGame();
    if (result.ok) {
      return reply.send({ gameId: result.value });
    }
    return reply.status(400).send(result.error);
  });

  fastify.get<{ Params: { gameId: string } }>('/games/:gameId', async (request) => {
    const { gameId } = request.params;
    const result = gameApplicationService.getGameState(gameId);
    if (result.ok) {
      return result.value;
    }
    return { error: result.error };
  });
}
