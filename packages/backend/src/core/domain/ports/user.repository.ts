import { Result, ResultError } from "../../../application/utils/result.js";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface IUserRepository {
  findById(id: string): Promise<Result<User, ResultError>>;
  upsert(user: User): Promise<Result<void, ResultError>>;
}
