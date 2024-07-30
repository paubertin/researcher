export class UnsupportedException extends Error {
  public constructor(message?: string) {
    super(message);
  }
}