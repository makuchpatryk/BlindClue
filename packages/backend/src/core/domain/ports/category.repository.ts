import { Result, ResultError } from "../../../application/utils/result.js";

export interface Category {
  id: string;
  name: string;
}

export interface ICategoryRepository {
  getAll(): Promise<Result<Category[], ResultError>>;
  findById(id: string): Promise<Result<Category, ResultError>>;
  save(category: Category): Promise<Result<void, ResultError>>;
  delete(id: string): Promise<Result<void, ResultError>>;
}
