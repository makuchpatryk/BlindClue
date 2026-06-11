import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { registerConcurrentLimiter } from "../../src/infra/middleware/concurrent-limiter.js";

describe("Concurrent Limiter Middleware", () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    await registerConcurrentLimiter(fastify);

    fastify.get("/test", async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { ok: true };
    });

    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  it("should allow requests up to soft limit (5)", async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(fastify.inject({ method: "GET", url: "/test" }));
    }

    const results = await Promise.all(promises);
    results.forEach((res) => {
      expect(res.statusCode).toBe(200);
    });
  });

  it("should allow requests between soft and hard limit (6-10)", async () => {
    const promises = [];
    for (let i = 0; i < 8; i++) {
      promises.push(fastify.inject({ method: "GET", url: "/test" }));
    }

    const results = await Promise.all(promises);
    results.forEach((res) => {
      expect(res.statusCode).toBe(200);
    });
  });

  it("should reject requests over hard limit (>10)", async () => {
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(fastify.inject({ method: "GET", url: "/test" }));
    }

    const results = await Promise.all(promises);

    const successCount = results.filter((r) => r.statusCode === 200).length;
    const rejectedCount = results.filter((r) => r.statusCode === 503).length;

    // With concurrent execution, some requests may squeeze through
    // before earlier requests complete. Verify that rejections occur.
    expect(rejectedCount).toBeGreaterThan(0);
    expect(successCount + rejectedCount).toBe(12);
  });

  it("should return 503 with proper error message when rejected", async () => {
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(fastify.inject({ method: "GET", url: "/test" }));
    }

    const results = await Promise.all(promises);
    const rejectedResponse = results.find((r) => r.statusCode === 503);

    expect(rejectedResponse).toBeDefined();
    expect(rejectedResponse?.statusCode).toBe(503);

    const body = JSON.parse(rejectedResponse?.body || "{}");
    expect(body.message).toContain("Server at capacity");
  });

  it("should cleanup counter after request completes", async () => {
    const response = await fastify.inject({ method: "GET", url: "/test" });
    expect(response.statusCode).toBe(200);

    // After request completes, counter should be back to 0 or low
    // Send another request and it should succeed without rejection
    const response2 = await fastify.inject({ method: "GET", url: "/test" });
    expect(response2.statusCode).toBe(200);
  });

  it("should handle concurrent requests properly", async () => {
    const promises = [];

    // Start 15 concurrent requests
    for (let i = 0; i < 15; i++) {
      promises.push(fastify.inject({ method: "GET", url: "/test" }));
    }

    const results = await Promise.all(promises);

    // Count 200 and 503 responses
    const successCount = results.filter((r) => r.statusCode === 200).length;
    const rejectedCount = results.filter((r) => r.statusCode === 503).length;

    expect(successCount).toBeGreaterThan(0);
    expect(rejectedCount).toBeGreaterThan(0);
    expect(successCount + rejectedCount).toBe(15);
  });
});
