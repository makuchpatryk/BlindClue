import { JWTPayload } from "jose";
import { CognitoAuthService } from "../adapters/auth/cognito.auth-service.js";
import { Result, ResultError } from "../../application/utils/result.js";

export async function verifyJwtAndExtractUserId(
  token: string | undefined,
  authService: CognitoAuthService,
): Promise<Result<string, ResultError>> {
  if (!token) {
    return {
      ok: false,
      error: new ResultError("UNAUTHORIZED", "No token provided"),
    };
  }

  const result = await authService.verifyAccessToken(token);
  if (!result.ok) {
    return result as Result<never, ResultError>;
  }

  const userId = result.value.sub as string;
  if (!userId) {
    return {
      ok: false,
      error: new ResultError("INVALID_TOKEN", "Token missing user ID"),
    };
  }

  return { ok: true, value: userId };
}
