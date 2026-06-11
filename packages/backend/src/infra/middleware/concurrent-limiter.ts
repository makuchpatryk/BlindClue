import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const SOFT_LIMIT = 5;
const HARD_LIMIT = 10;

let activeRequests = 0;

export const registerConcurrentLimiter = async (fastify: FastifyInstance) => {
  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      activeRequests++;

      if (activeRequests > HARD_LIMIT) {
        activeRequests--;
        fastify.log.warn(
          `Rejecting request: concurrent limit exceeded (${activeRequests} active)`,
        );
        return reply.code(503).send({
          error: "Service Unavailable",
          message: "Server at capacity. Please try again later.",
        });
      }

      if (activeRequests > SOFT_LIMIT) {
        fastify.log.info(
          `Concurrent requests elevated: ${activeRequests}/${HARD_LIMIT}`,
        );
      }
    },
  );

  fastify.addHook("onResponse", async () => {
    activeRequests--;
  });

  fastify.addHook("onError", async () => {
    activeRequests--;
  });
};
