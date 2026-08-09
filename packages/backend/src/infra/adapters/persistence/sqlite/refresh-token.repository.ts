import sqlite3 from "sqlite3";
import {
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from "../../../../core/domain/ports/refresh-token.repository.js";
import { Result, ResultError } from "../../../../application/utils/result.js";
import { DatabaseUtility } from "../../../utils/database.js";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private db: sqlite3.Database) {}

  async save(record: RefreshTokenRecord): Promise<Result<void, ResultError>> {
    return DatabaseUtility.exec(
      this.db,
      `INSERT INTO refresh_tokens (token_hash, user_id, expires_at)
       VALUES (?, ?, ?)`,
      [record.tokenHash, record.userId, record.expiresAt.toISOString()],
    );
  }

  async findValid(
    tokenHash: string,
  ): Promise<Result<RefreshTokenRecord, ResultError>> {
    const result = await DatabaseUtility.query<any>(
      this.db,
      `SELECT token_hash, user_id, expires_at FROM refresh_tokens
       WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash],
    );

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      value: {
        tokenHash: result.value.token_hash,
        userId: result.value.user_id,
        expiresAt: new Date(result.value.expires_at),
      },
    };
  }

  async revoke(tokenHash: string): Promise<Result<void, ResultError>> {
    return DatabaseUtility.exec(
      this.db,
      `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?`,
      [tokenHash],
    );
  }
}
