import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { createHmac } from "crypto";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminUpdateUserAttributesCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Result, ResultError } from "../../../application/utils/result.js";

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  callbackUrl: string;
  issuer: string;
  nodeEnv: string;
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export class CognitoAuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private client: CognitoIdentityProviderClient;
  private config: CognitoConfig;

  constructor(cognitoConfig: CognitoConfig) {
    this.config = cognitoConfig;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.config.issuer}/.well-known/jwks.json`),
    );
    this.client = new CognitoIdentityProviderClient({
      region: this.config.region,
    });
  }

  private computeSecretHash(username: string): string {
    return createHmac("sha256", this.config.clientSecret)
      .update(username + this.config.clientId)
      .digest("base64");
  }

  buildLoginUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      scope: "openid email",
      redirect_uri: this.config.callbackUrl,
      state,
    });
    return `https://${this.config.domain}/oauth2/authorize?${params.toString()}`;
  }

  private basicAuthHeader(): string {
    const credentials = `${this.config.clientId}:${this.config.clientSecret}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  async exchangeCodeForTokens(
    code: string,
  ): Promise<Result<CognitoTokens, ResultError>> {
    return this.requestTokens({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.callbackUrl,
    });
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<Result<CognitoTokens, ResultError>> {
    return this.requestTokens({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
  }

  private async requestTokens(
    params: Record<string, string>,
  ): Promise<Result<CognitoTokens, ResultError>> {
    try {
      const body = new URLSearchParams({
        client_id: this.config.clientId,
        ...params,
      });

      const response = await fetch(
        `https://${this.config.domain}/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: this.basicAuthHeader(),
          },
          body: body.toString(),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return {
          ok: false,
          error: new ResultError(
            "COGNITO_TOKEN_ERROR",
            `Cognito token endpoint failed: ${response.status} ${text}`,
          ),
        };
      }

      const data = (await response.json()) as {
        access_token: string;
        id_token: string;
        refresh_token?: string;
        expires_in: number;
      };

      return {
        ok: true,
        value: {
          accessToken: data.access_token,
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: new ResultError(
          "COGNITO_TOKEN_ERROR",
          err instanceof Error ? err.message : "Unknown error",
        ),
      };
    }
  }

  async verifyAccessToken(
    token: string,
  ): Promise<Result<JWTPayload, ResultError>> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.config.issuer,
      });
      if (payload.token_use !== "access") {
        return {
          ok: false,
          error: new ResultError("INVALID_TOKEN", "Not an access token"),
        };
      }
      if (payload.client_id !== this.config.clientId) {
        return {
          ok: false,
          error: new ResultError("INVALID_TOKEN", "Client ID mismatch"),
        };
      }
      return { ok: true, value: payload };
    } catch (err) {
      return {
        ok: false,
        error: new ResultError(
          "INVALID_TOKEN",
          err instanceof Error ? err.message : "Token verification failed",
        ),
      };
    }
  }

  async verifyIdTokenAndGetUser(
    idToken: string,
  ): Promise<Result<AuthenticatedUser, ResultError>> {
    try {
      const { payload } = await jwtVerify(idToken, this.jwks, {
        issuer: this.config.issuer,
        audience: this.config.clientId,
      });
      if (payload.token_use !== "id") {
        return {
          ok: false,
          error: new ResultError("INVALID_TOKEN", "Not an ID token"),
        };
      }
      return {
        ok: true,
        value: {
          id: payload.sub as string,
          email: payload.email as string,
          name: (payload.name as string) || (payload.email as string),
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: new ResultError(
          "INVALID_TOKEN",
          err instanceof Error ? err.message : "Token verification failed",
        ),
      };
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await fetch(`https://${this.config.domain}/oauth2/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: this.basicAuthHeader(),
        },
        body: new URLSearchParams({
          token: refreshToken,
          client_id: this.config.clientId,
        }).toString(),
      });
    } catch {
      // best-effort — local revocation in refresh_tokens table is authoritative
    }
  }

  async signupUser(
    email: string,
    password: string,
  ): Promise<Result<{ userSub: string }, ResultError>> {
    try {
      const createUserResult = await this.client.send(
        new AdminCreateUserCommand({
          UserPoolId: this.config.userPoolId,
          Username: email,
          TemporaryPassword: password,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "email_verified", Value: "false" },
          ],
        }),
      );

      if (!createUserResult.User?.Username) {
        return {
          ok: false,
          error: new ResultError("SIGNUP_ERROR", "Failed to create user"),
        };
      }

      await this.client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.config.userPoolId,
          Username: email,
          Password: password,
          Permanent: true,
        }),
      );

      // Auto-verify email for development
      if (this.config.nodeEnv !== "production") {
        await this.client.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: this.config.userPoolId,
            Username: email,
            UserAttributes: [{ Name: "email_verified", Value: "true" }],
          }),
        );
      }

      return {
        ok: true,
        value: { userSub: createUserResult.User.Attributes?.find((a) => a.Name === "sub")?.Value || email },
      };
    } catch (err) {
      const errorMessage = this.parseAwsError(err);
      if (errorMessage.includes("already exists")) {
        return {
          ok: false,
          error: new ResultError("USER_EXISTS", "Email already registered"),
        };
      }
      if (errorMessage.includes("password")) {
        return {
          ok: false,
          error: new ResultError("INVALID_PASSWORD", errorMessage),
        };
      }
      return {
        ok: false,
        error: new ResultError("SIGNUP_ERROR", errorMessage),
      };
    }
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<Result<CognitoTokens, ResultError>> {
    try {
      const result = await this.client.send(
        new AdminInitiateAuthCommand({
          UserPoolId: this.config.userPoolId,
          ClientId: this.config.clientId,
          AuthFlow: "ADMIN_NO_SRP_AUTH",
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: this.computeSecretHash(email),
          },
        }),
      );

      if (!result.AuthenticationResult) {
        return {
          ok: false,
          error: new ResultError("AUTH_ERROR", "Authentication failed"),
        };
      }

      return {
        ok: true,
        value: {
          accessToken: result.AuthenticationResult.AccessToken || "",
          idToken: result.AuthenticationResult.IdToken || "",
          refreshToken: result.AuthenticationResult.RefreshToken,
          expiresIn: result.AuthenticationResult.ExpiresIn || 3600,
        },
      };
    } catch (err) {
      const errorMessage = this.parseAwsError(err);
      if (errorMessage.includes("not found")) {
        return {
          ok: false,
          error: new ResultError("INVALID_CREDENTIALS", "Invalid email or password"),
        };
      }
      if (errorMessage.includes("not confirmed")) {
        return {
          ok: false,
          error: new ResultError("USER_NOT_CONFIRMED", "Email not verified. Check your inbox."),
        };
      }
      return {
        ok: false,
        error: new ResultError("AUTH_ERROR", "Invalid email or password"),
      };
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<Result<{ codeDeliveryDetails?: string }, ResultError>> {
    try {
      const result = await this.client.send(
        new ForgotPasswordCommand({
          ClientId: this.config.clientId,
          Username: email,
          SecretHash: this.computeSecretHash(email),
        }),
      );

      return {
        ok: true,
        value: {
          codeDeliveryDetails: result.CodeDeliveryDetails?.Destination,
        },
      };
    } catch (err) {
      const errorMessage = this.parseAwsError(err);
      if (errorMessage.includes("not found")) {
        return {
          ok: false,
          error: new ResultError("USER_NOT_FOUND", "Email not found"),
        };
      }
      return {
        ok: false,
        error: new ResultError("FORGOT_PASSWORD_ERROR", errorMessage),
      };
    }
  }

  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<Result<void, ResultError>> {
    try {
      await this.client.send(
        new ConfirmForgotPasswordCommand({
          ClientId: this.config.clientId,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
          SecretHash: this.computeSecretHash(email),
        }),
      );

      return { ok: true, value: undefined };
    } catch (err) {
      const errorMessage = this.parseAwsError(err);
      if (errorMessage.includes("Invalid verification code")) {
        return {
          ok: false,
          error: new ResultError("INVALID_CODE", "Invalid or expired reset code"),
        };
      }
      if (errorMessage.includes("password")) {
        return {
          ok: false,
          error: new ResultError("INVALID_PASSWORD", errorMessage),
        };
      }
      return {
        ok: false,
        error: new ResultError("RESET_ERROR", errorMessage),
      };
    }
  }

  private parseAwsError(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === "object" && err !== null) {
      return JSON.stringify(err);
    }
    return "Unknown error";
  }
}
