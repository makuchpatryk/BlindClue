export class DomainException extends Error {
  constructor(
    readonly code: string,
    readonly message: string,
  ) {
    super(message);
    this.name = "DomainException";
  }
}
