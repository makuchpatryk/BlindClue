export class Word {
  constructor(
    private id: string,
    private categoryId: string,
    private text: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getCategoryId(): string {
    return this.categoryId;
  }

  getText(): string {
    return this.text;
  }
}
