import { FastifyReply, FastifyRequest } from "fastify";
import "../middleware/types.js";
import { CognitoAuthService } from "../adapters/auth/cognito.auth-service.js";
import { verifyJwtAndExtractUserId } from "../utils/jwt.js";

export function createJwtAuthMiddleware(authService: CognitoAuthService) {
  return async function jwtAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const token = request.cookies?.access_token;
    const result = await verifyJwtAndExtractUserId(token, authService);
    if (!result.ok) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    request.userId = result.value;
  };
}
