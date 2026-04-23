export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export class ResultError {
  constructor(
    readonly code: string,
    readonly message: string
  ) {}
}
