import { FastifyRequest, FastifyReply } from "fastify";
import { ResultError } from "../../../application/utils/result.js";

export class HttpExceptionFilter {
  static handle(
    error: any,
    request: FastifyRequest,
    reply: FastifyReply,
  ): FastifyReply {
    console.error("Error:", error);

    if (error instanceof ResultError) {
      return reply.status(400).send({
        error: error.code,
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }
}
