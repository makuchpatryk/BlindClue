import sqlite3 from "sqlite3";
import { Result, ResultError } from "../../application/utils/result.js";

export class DatabaseUtility {
  static query<T>(
    db: sqlite3.Database,
    sql: string,
    params: any[] = [],
  ): Promise<Result<T, ResultError>> {
    return new Promise((resolve) => {
      db.get(sql, params, (err: Error | null, row: any) => {
        if (err) {
          resolve({ ok: false, error: new ResultError("DB_ERROR", err.message) });
          return;
        }
        if (!row) {
          resolve({
            ok: false,
            error: new ResultError("NOT_FOUND", "Record not found"),
          });
          return;
        }
        resolve({ ok: true, value: row as T });
      });
    });
  }

  static exec(
    db: sqlite3.Database,
    sql: string,
    params: any[] = [],
  ): Promise<Result<void, ResultError>> {
    return new Promise((resolve) => {
      db.run(sql, params, (err: Error | null) => {
        if (err) {
          resolve({ ok: false, error: new ResultError("DB_ERROR", err.message) });
        } else {
          resolve({ ok: true, value: undefined });
        }
      });
    });
  }
}
