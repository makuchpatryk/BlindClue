import { Result, ResultError } from '../utils/result.js';
import { ICategoryRepository, Category } from '../../core/domain/ports/category.repository.js';
import { IWordRepository } from '../../core/domain/ports/word.repository.js';
import { Word } from '../../core/domain/entities/word.js';
import { IdGenerator } from '../utils/id-generator.js';

export class AdminGameService {
  constructor(
    private categoryRepository: ICategoryRepository,
    private wordRepository: IWordRepository
  ) {}

  async createCategory(name: string): Promise<Result<string, ResultError>> {
    const categoryId = IdGenerator.categoryId();
    const category: Category = { id: categoryId, name };
    const result = await this.categoryRepository.save(category);
    if (result.ok) {
      return { ok: true, value: categoryId };
    }
    return result;
  }

  async getCategories(): Promise<Result<Category[], ResultError>> {
    return this.categoryRepository.getAll();
  }

  async deleteCategory(categoryId: string): Promise<Result<void, ResultError>> {
    return this.categoryRepository.delete(categoryId);
  }

  async addWord(categoryId: string, word: string): Promise<Result<string, ResultError>> {
    const wordId = IdGenerator.wordId();
    const wordEntity = new Word(wordId, categoryId, word);
    const result = await this.wordRepository.save(wordEntity);
    if (result.ok) {
      return { ok: true, value: wordId };
    }
    return result;
  }

  async deleteWord(wordId: string): Promise<Result<void, ResultError>> {
    return this.wordRepository.delete(wordId);
  }
}
