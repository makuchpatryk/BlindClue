import Database from 'better-sqlite3';
import { Word } from '../../../../core/domain/entities/word.js';
import { IWordRepository } from '../../../../core/domain/ports/word.repository.js';
import { Result, ResultError } from '../../../../application/utils/result.js';
import { IdGenerator } from '../../../../application/utils/id-generator.js';

export class WordRepository implements IWordRepository {
  constructor(private db: Database.Database) {}

  async getRandomWord(categoryId?: string): Promise<Result<Word, ResultError>> {
    try {
      let query = 'SELECT id, category_id, word FROM words';
      const params: any[] = [];

      if (categoryId) {
        query += ' WHERE category_id = ?';
        params.push(categoryId);
      }

      query += ' ORDER BY RANDOM() LIMIT 1';

      const stmt = this.db.prepare(query);
      const row = categoryId ? stmt.get(...params) : stmt.get();

      if (!row) {
        return { ok: false, error: new ResultError('NO_WORDS', 'No words available') };
      }

      const word = new Word(row.id, row.category_id, row.word);
      return { ok: true, value: word };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async findById(id: string): Promise<Result<Word, ResultError>> {
    try {
      const stmt = this.db.prepare('SELECT id, category_id, word FROM words WHERE id = ?');
      const row = stmt.get(id);

      if (!row) {
        return { ok: false, error: new ResultError('NOT_FOUND', 'Word not found') };
      }

      const word = new Word(row.id, row.category_id, row.word);
      return { ok: true, value: word };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async save(word: Word): Promise<Result<void, ResultError>> {
    try {
      const stmt = this.db.prepare(
        'INSERT INTO words (id, category_id, word) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET word = excluded.word'
      );
      stmt.run(word.getId(), word.getCategoryId(), word.getText());
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }

  async delete(id: string): Promise<Result<void, ResultError>> {
    try {
      const stmt = this.db.prepare('DELETE FROM words WHERE id = ?');
      stmt.run(id);
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: new ResultError('DB_ERROR', (error as Error).message) };
    }
  }
}
