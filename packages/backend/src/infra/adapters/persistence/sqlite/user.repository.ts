import sqlite3 from "sqlite3";
import { IUserRepository, User } from "../../../../core/domain/ports/user.repository.js";
import { Result, ResultError } from "../../../../application/utils/result.js";
import { DatabaseUtility } from "../../../utils/database.js";

export class UserRepository implements IUserRepository {
  constructor(private db: sqlite3.Database) {}

  async findById(id: string): Promise<Result<User, ResultError>> {
    const result = await DatabaseUtility.query<any>(
      this.db,
      "SELECT id, email, name FROM users WHERE id = ?",
      [id],
    );

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      value: {
        id: result.value.id,
        email: result.value.email,
        name: result.value.name,
      },
    };
  }

  async upsert(user: User): Promise<Result<void, ResultError>> {
    return DatabaseUtility.exec(
      this.db,
      `INSERT INTO users (id, email, name, last_login)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         last_login = CURRENT_TIMESTAMP`,
      [user.id, user.email, user.name],
    );
  }
}
