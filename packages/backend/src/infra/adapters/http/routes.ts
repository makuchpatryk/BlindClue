import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AdminGameService } from "../../../application/services/admin-game.service.js";
import { GameApplicationService } from "../../../application/services/game.application-service.js";
import { GameOrchestrator } from "../../../application/services/game.orchestrator.js";

function csrfProtect(request: FastifyRequest, reply: FastifyReply): boolean {
  const cookieToken = request.cookies?.csrf_token;
  const headerToken = request.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    reply.status(403).send({ error: "Invalid CSRF token" });
    return false;
  }
  return true;
}

export async function registerRoutes(
  fastify: FastifyInstance,
  adminGameService: AdminGameService,
  gameApplicationService: GameApplicationService,
  gameOrchestrator: GameOrchestrator,
  jwtAuthMiddleware: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
) {
  // Health check
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  // Category routes
  fastify.post<{ Body: { name: string } }>(
    "/api/admin/categories",
    async (request, reply) => {
      const { name } = request.body;
      const result = await adminGameService.createCategory(name);
      if (result.ok) {
        return reply.send({ categoryId: result.value });
      }
      return reply.status(400).send(result.error);
    },
  );

  fastify.get("/api/admin/categories", async () => {
    const result = await adminGameService.getCategories();
    if (result.ok) {
      return result.value;
    }
    return { error: result.error };
  });

  fastify.delete<{ Params: { id: string } }>(
    "/api/admin/categories/:id",
    async (request, reply) => {
      const { id } = request.params;
      const result = await adminGameService.deleteCategory(id);
      if (result.ok) {
        return reply.send({ success: true });
      }
      return reply.status(400).send(result.error);
    },
  );

  // Word routes
  fastify.post<{ Body: { categoryId: string; word: string } }>(
    "/api/admin/words",
    async (request, reply) => {
      const { categoryId, word } = request.body;
      const result = await adminGameService.addWord(categoryId, word);
      if (result.ok) {
        return reply.send({ wordId: result.value });
      }
      return reply.status(400).send(result.error);
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/api/admin/words/:id",
    async (request, reply) => {
      const { id } = request.params;
      const result = await adminGameService.deleteWord(id);
      if (result.ok) {
        return reply.send({ success: true });
      }
      return reply.status(400).send(result.error);
    },
  );

  // Game routes (protected)
  fastify.post<{ Body: { numberOfRounds?: number } }>(
    "/api/games",
    { preHandler: jwtAuthMiddleware },
    async (request, reply) => {
      if (!csrfProtect(request, reply)) return;
      const { numberOfRounds = 3 } = request.body || {};
      const result = await gameOrchestrator.createGame(numberOfRounds);
      if (result.ok) {
        return reply.send({ gameId: result.value });
      }
      return reply.status(400).send(result.error);
    },
  );

  fastify.get<{ Params: { gameId: string } }>(
    "/api/games/:gameId",
    { preHandler: jwtAuthMiddleware },
    async (request) => {
      const { gameId } = request.params;
      const result = gameApplicationService.getGameState(gameId);
      if (result.ok) {
        return result.value;
      }
      return { error: result.error };
    },
  );
}
