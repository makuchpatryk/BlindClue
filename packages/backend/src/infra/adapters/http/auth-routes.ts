import { randomBytes } from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { CognitoAuthService } from "../auth/cognito.auth-service.js";
import { IUserRepository } from "../../../core/domain/ports/user.repository.js";
import { IRefreshTokenRepository } from "../../../core/domain/ports/refresh-token.repository.js";
import { hashToken } from "../../utils/crypto.js";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface AuthRoutesConfig {
  cookieSecret?: string;
  frontendUrl: string;
  nodeEnv: string;
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

function validatePassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

function validateCsrfToken(request: FastifyRequest, reply: FastifyReply): boolean {
  const csrfToken = (request.body as any)?.csrfToken;
  const cookieToken = request.cookies?.csrf_token;
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    return false;
  }
  return true;
}

function baseCookieOptions(nodeEnv: string) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function setSessionCookies(
  reply: FastifyReply,
  tokens: { accessToken: string; refreshToken?: string; expiresIn: number },
  nodeEnv: string,
) {
  reply.setCookie("access_token", tokens.accessToken, {
    ...baseCookieOptions(nodeEnv),
    maxAge: tokens.expiresIn,
  });

  if (tokens.refreshToken) {
    reply.setCookie("refresh_token", tokens.refreshToken, {
      ...baseCookieOptions(nodeEnv),
      maxAge: REFRESH_TOKEN_TTL_MS / 1000,
    });
  }

  const csrfToken = randomBytes(24).toString("hex");
  reply.setCookie("csrf_token", csrfToken, {
    ...baseCookieOptions(nodeEnv),
    httpOnly: false,
    maxAge: tokens.expiresIn,
  });
}

function clearSessionCookies(reply: FastifyReply, nodeEnv: string) {
  const opts = baseCookieOptions(nodeEnv);
  reply.clearCookie("access_token", opts);
  reply.clearCookie("refresh_token", opts);
  reply.clearCookie("csrf_token", { ...opts, httpOnly: false });
}

export async function registerAuthRoutes(
  fastify: FastifyInstance,
  authService: CognitoAuthService,
  userRepository: IUserRepository,
  refreshTokenRepository: IRefreshTokenRepository,
  authConfig: AuthRoutesConfig,
) {
  fastify.get("/api/auth/login", async (request, reply) => {
    const state = randomBytes(16).toString("hex");
    reply.setCookie("oauth_state", state, {
      ...baseCookieOptions(authConfig.nodeEnv),
      httpOnly: true,
      maxAge: 300,
    });
    return reply.redirect(authService.buildLoginUrl(state));
  });

  fastify.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
    "/api/auth/callback",
    async (request, reply) => {
      const { code, state, error } = request.query;
      const expectedState = request.cookies?.oauth_state;
      reply.clearCookie("oauth_state", baseCookieOptions(authConfig.nodeEnv));

      if (error || !code || !state || state !== expectedState) {
        return reply
          .status(400)
          .send({ error: "Invalid or expired login attempt" });
      }

      const tokenResult = await authService.exchangeCodeForTokens(code);
      if (!tokenResult.ok) {
        return reply.status(401).send({ error: tokenResult.error.message });
      }

      const userResult = await authService.verifyIdTokenAndGetUser(
        tokenResult.value.idToken,
      );
      if (!userResult.ok) {
        return reply.status(401).send({ error: userResult.error.message });
      }

      await userRepository.upsert(userResult.value);

      if (tokenResult.value.refreshToken) {
        await refreshTokenRepository.save({
          tokenHash: hashToken(tokenResult.value.refreshToken),
          userId: userResult.value.id,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });
      }

      setSessionCookies(reply, tokenResult.value, authConfig.nodeEnv);
      return reply.redirect(`${authConfig.frontendUrl}/lobby`);
    },
  );

  fastify.get("/api/auth/me", async (request, reply) => {
    const token = request.cookies?.access_token;
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const result = await authService.verifyAccessToken(token);
    if (!result.ok) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const userResult = await userRepository.findById(result.value.sub as string);
    if (!userResult.ok) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    return reply.send({ user: userResult.value });
  });

  fastify.post<{ Body: { csrfToken?: string } }>(
    "/api/auth/refresh",
    async (request, reply) => {
      if (!validateCsrfToken(request, reply)) {
        return reply
          .status(403)
          .send({ error: "CSRF token invalid or missing" });
      }

      const refreshToken = request.cookies?.refresh_token;
      if (!refreshToken) {
        return reply.status(401).send({ error: "No refresh token" });
      }

      const record = await refreshTokenRepository.findValid(
        hashToken(refreshToken),
      );
      if (!record.ok) {
        clearSessionCookies(reply, authConfig.nodeEnv);
        return reply.status(401).send({ error: "Refresh token invalid or expired" });
      }

      const tokenResult = await authService.refreshTokens(refreshToken);
      if (!tokenResult.ok) {
        clearSessionCookies(reply, authConfig.nodeEnv);
        return reply.status(401).send({ error: tokenResult.error.message });
      }

      setSessionCookies(reply, {
        accessToken: tokenResult.value.accessToken,
        refreshToken: undefined,
        expiresIn: tokenResult.value.expiresIn,
      }, authConfig.nodeEnv);

      return reply.send({ ok: true });
    },
  );

  fastify.post<{ Body: { csrfToken?: string } }>(
    "/api/auth/logout",
    async (request, reply) => {
      if (!validateCsrfToken(request, reply)) {
        return reply
          .status(403)
          .send({ error: "CSRF token invalid or missing" });
      }

      const refreshToken = request.cookies?.refresh_token;
      if (refreshToken) {
        await refreshTokenRepository.revoke(hashToken(refreshToken));
        await authService.revokeRefreshToken(refreshToken);
      }
      clearSessionCookies(reply, authConfig.nodeEnv);
      return reply.send({ ok: true });
    },
  );

  fastify.post<{ Body: { email?: string; password?: string; csrfToken?: string } }>(
    "/api/auth/signup",
    async (request, reply) => {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email and password required" });
      }

      if (!validateEmail(email)) {
        return reply
          .status(400)
          .send({ error: "Invalid email format" });
      }

      if (!validatePassword(password)) {
        return reply
          .status(400)
          .send({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }

      if (!validateCsrfToken(request, reply)) {
        return reply
          .status(403)
          .send({ error: "CSRF token invalid or missing" });
      }

      const signupResult = await authService.signupUser(email, password);
      if (!signupResult.ok) {
        return reply.status(400).send({ error: signupResult.error.message });
      }

      return reply.send({
        ok: true,
        message: "Signup successful. Please check your email to verify your account.",
      });
    },
  );

  fastify.post<{ Body: { email?: string; password?: string; csrfToken?: string } }>(
    "/api/auth/signin",
    async (request, reply) => {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply
          .status(400)
          .send({ error: "Email and password required" });
      }

      if (!validateEmail(email)) {
        return reply
          .status(400)
          .send({ error: "Invalid email format" });
      }

      if (!validatePassword(password)) {
        return reply
          .status(400)
          .send({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }

      if (!validateCsrfToken(request, reply)) {
        return reply
          .status(403)
          .send({ error: "CSRF token invalid or missing" });
      }

      const authResult = await authService.authenticateUser(email, password);
      if (!authResult.ok) {
        return reply.status(401).send({ error: authResult.error.message });
      }

      const userResult = await authService.verifyIdTokenAndGetUser(
        authResult.value.idToken,
      );
      if (!userResult.ok) {
        return reply.status(401).send({ error: "Failed to verify user" });
      }

      await userRepository.upsert(userResult.value);

      if (authResult.value.refreshToken) {
        await refreshTokenRepository.save({
          tokenHash: hashToken(authResult.value.refreshToken),
          userId: userResult.value.id,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });
      }

      setSessionCookies(reply, authResult.value, authConfig.nodeEnv);
      return reply.send({ ok: true, user: userResult.value });
    },
  );

  fastify.post<{ Body: { email?: string } }>(
    "/api/auth/forgot-password",
    async (request, reply) => {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({ error: "Email required" });
      }

      const result = await authService.forgotPassword(email);
      if (!result.ok) {
        return reply.status(400).send({ error: result.error.message });
      }

      return reply.send({
        ok: true,
        message: "Password reset code sent to your email",
      });
    },
  );

  fastify.post<{ Body: { email?: string; code?: string; password?: string } }>(
    "/api/auth/confirm-reset",
    async (request, reply) => {
      const { email, code, password } = request.body;

      if (!email || !code || !password) {
        return reply
          .status(400)
          .send({ error: "Email, code, and password required" });
      }

      const result = await authService.confirmForgotPassword(
        email,
        code,
        password,
      );
      if (!result.ok) {
        return reply.status(400).send({ error: result.error.message });
      }

      return reply.send({
        ok: true,
        message: "Password reset successful. Please log in with your new password.",
      });
    },
  );
}
