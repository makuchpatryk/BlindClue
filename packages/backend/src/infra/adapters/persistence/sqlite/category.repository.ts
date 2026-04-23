import Database from 'better-sqlite3';
import { Category, ICategoryRepository } from '../../../../core/domain/ports/category.repository.js';
import { Result, ResultError } from '../../../../application/utils/result.js';

export class CategoryRepository implements ICategoryRepository {
  constructor(private db: Database.Database) {}

  async getAll(): Promise<Result<Category[], ResultError>> {
    try {
      const stmt = this.db.prepare('SELECT id, name FROM categories');
      const rows = stmt.all();
      const categories = rows.map(row => ({ id: row.id, name: row.name }));
      return { ok: true, value: categories };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async findById(id: string): Promise<Result<Category, ResultError>> {
    try {
      const stmt = this.db.prepare('SELECT id, name FROM categories WHERE id = ?');
      const row = stmt.get(id);

      if (!row) {
        return { ok: false, error: new ResultError('NOT_FOUND', 'Category not found') };
      }

      return { ok: true, value: { id: row.id, name: row.name } };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async save(category: Category): Promise<Result<void, ResultError>> {
    try {
      const stmt = this.db.prepare(
        'INSERT INTO categories (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name'
      );
      stmt.run(category.id, category.name);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async delete(id: string): Promise<Result<void, ResultError>> {
    try {
      const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
      stmt.run(id);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }
}
