import sqlite3 from 'sqlite3';
import { Word } from '../../../../core/domain/entities/word.js';
import { IWordRepository } from '../../../../core/domain/ports/word.repository.js';
import { Result, ResultError } from '../../../../application/utils/result.js';

export class WordRepository implements IWordRepository {
  constructor(private db: sqlite3.Database) {}

  async getRandomWord(categoryId?: string): Promise<Result<Word, ResultError>> {
    return new Promise((resolve) => {
      let query = 'SELECT id, category_id, word FROM words';
      const params: any[] = [];

      if (categoryId) {
        query += ' WHERE category_id = ?';
        params.push(categoryId);
      }

      query += ' ORDER BY RANDOM() LIMIT 1';

      this.db.get(query, params, (err: Error | null, row: any) => {
        if (err) {
          resolve({ ok: false, error: new ResultError('DB_ERROR', err.message) });
          return;
        }

        if (!row) {
          resolve({ ok: false, error: new ResultError('NO_WORDS', 'No words available') });
          return;
        }

        const word = new Word(row.id, row.category_id, row.word);
        resolve({ ok: true, value: word });
      });
    });
  }

  async findById(id: string): Promise<Result<Word, ResultError>> {
    return new Promise((resolve) => {
      this.db.get('SELECT id, category_id, word FROM words WHERE id = ?', [id], (err: Error | null, row: any) => {
        if (err) {
          resolve({ ok: false, error: new ResultError('DB_ERROR', err.message) });
          return;
        }

        if (!row) {
          resolve({ ok: false, error: new ResultError('NOT_FOUND', 'Word not found') });
          return;
        }

        const word = new Word(row.id, row.category_id, row.word);
        resolve({ ok: true, value: word });
      });
    });
  }

  async save(word: Word): Promise<Result<void, ResultError>> {
    return new Promise((resolve) => {
      this.db.run(
        'INSERT INTO words (id, category_id, word) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET word = excluded.word',
        [word.getId(), word.getCategoryId(), word.getText()],
        (err: Error | null) => {
          if (err) {
            resolve({ ok: false, error: new ResultError('DB_ERROR', err.message) });
          } else {
            resolve({ ok: true, value: undefined });
          }
        }
      );
    });
  }

  async delete(id: string): Promise<Result<void, ResultError>> {
    return new Promise((resolve) => {
      this.db.run('DELETE FROM words WHERE id = ?', [id], (err: Error | null) => {
        if (err) {
          resolve({ ok: false, error: new ResultError('DB_ERROR', err.message) });
        } else {
          resolve({ ok: true, value: undefined });
        }
      });
    });
  }
}
