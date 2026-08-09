import { Socket } from "socket.io";
import { CognitoAuthService } from "../auth/cognito.auth-service.js";
import { verifyJwtAndExtractUserId } from "../../utils/jwt.js";

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const parts = header.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

export function createSocketAuthMiddleware(authService: CognitoAuthService) {
  return async function socketAuthMiddleware(
    socket: Socket,
    next: (err?: Error) => void,
  ): Promise<void> {
    const token = parseCookie(socket.handshake.headers.cookie, "access_token");
    const result = await verifyJwtAndExtractUserId(token, authService);
    if (!result.ok) {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.userId = result.value;
    next();
  };
}
