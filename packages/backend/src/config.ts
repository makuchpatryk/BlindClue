import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const defaultFrontendUrl = isProduction
  ? "https://localhost:8443"
  : "http://localhost:8000";
const defaultCorsOrigin = isProduction
  ? "https://localhost:8443"
  : "http://localhost:8000";

const cookieSecret = (() => {
  if (process.env.COOKIE_SECRET) return process.env.COOKIE_SECRET;
  if (isProduction) {
    throw new Error(
      "COOKIE_SECRET environment variable is required in production",
    );
  }
  return "dev-cookie-secret-change-me";
})();

export const config = {
  nodeEnv,
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  databasePath: process.env.DATABASE_PATH || "./data/impostor.db",
  corsOrigin: process.env.CORS_ORIGIN || defaultCorsOrigin,
  frontendUrl: process.env.FRONTEND_URL || defaultFrontendUrl,
  cookieSecret,
  cognito: {
    region: process.env.COGNITO_REGION || "",
    userPoolId: process.env.COGNITO_USER_POOL_ID || "",
    clientId: process.env.COGNITO_CLIENT_ID || "",
    clientSecret: process.env.COGNITO_CLIENT_SECRET || "",
    domain: process.env.COGNITO_DOMAIN || "",
    callbackUrl:
      process.env.COGNITO_CALLBACK_URL ||
      "http://localhost:3000/api/auth/callback",
    get issuer() {
      return `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}`;
    },
  },
};
