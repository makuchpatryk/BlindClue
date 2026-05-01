import sqlite3 from "sqlite3";
import {
  Category,
  ICategoryRepository,
} from "@backend/core/domain/ports/category.repository";
import { Result, ResultError } from "@backend/application/utils/result";

export class CategoryRepository implements ICategoryRepository {
  constructor(private db: sqlite3.Database) {}

  async getAll(): Promise<Result<Category[], ResultError>> {
    return new Promise((resolve) => {
      this.db.all(
        "SELECT id, name FROM categories",
        (err: Error | null, rows: any[]) => {
          if (err) {
            resolve({
              ok: false,
              error: new ResultError("DB_ERROR", err.message),
            });
            return;
          }

          const categories = (rows || []).map((row) => ({
            id: row.id,
            name: row.name,
          }));
          resolve({ ok: true, value: categories });
        },
      );
    });
  }

  async findById(id: string): Promise<Result<Category, ResultError>> {
    return new Promise((resolve) => {
      this.db.get(
        "SELECT id, name FROM categories WHERE id = ?",
        [id],
        (err: Error | null, row: any) => {
          if (err) {
            resolve({
              ok: false,
              error: new ResultError("DB_ERROR", err.message),
            });
            return;
          }

          if (!row) {
            resolve({
              ok: false,
              error: new ResultError("NOT_FOUND", "Category not found"),
            });
            return;
          }

          resolve({ ok: true, value: { id: row.id, name: row.name } });
        },
      );
    });
  }

  async save(category: Category): Promise<Result<void, ResultError>> {
    return new Promise((resolve) => {
      this.db.run(
        "INSERT INTO categories (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name",
        [category.id, category.name],
        (err: Error | null) => {
          if (err) {
            resolve({
              ok: false,
              error: new ResultError("DB_ERROR", err.message),
            });
          } else {
            resolve({ ok: true, value: undefined });
          }
        },
      );
    });
  }

  async delete(id: string): Promise<Result<void, ResultError>> {
    return new Promise((resolve) => {
      this.db.run(
        "DELETE FROM categories WHERE id = ?",
        [id],
        (err: Error | null) => {
          if (err) {
            resolve({
              ok: false,
              error: new ResultError("DB_ERROR", err.message),
            });
          } else {
            resolve({ ok: true, value: undefined });
          }
        },
      );
    });
  }
}
