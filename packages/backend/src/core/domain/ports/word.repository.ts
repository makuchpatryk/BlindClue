import { Word } from '../entities/word.js';
import { Result, ResultError } from '../../../application/utils/result.js';

export interface IWordRepository {
  getRandomWord(categoryId?: string): Promise<Result<Word, ResultError>>;
  findById(id: string): Promise<Result<Word, ResultError>>;
  save(word: Word): Promise<Result<void, ResultError>>;
  delete(id: string): Promise<Result<void, ResultError>>;
}
