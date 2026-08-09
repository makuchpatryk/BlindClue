import { Result, ResultError } from "../../../application/utils/result.js";

export interface RefreshTokenRecord {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface IRefreshTokenRepository {
  save(record: RefreshTokenRecord): Promise<Result<void, ResultError>>;
  findValid(tokenHash: string): Promise<Result<RefreshTokenRecord, ResultError>>;
  revoke(tokenHash: string): Promise<Result<void, ResultError>>;
}
