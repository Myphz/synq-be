export class AbortedError extends Error {
  constructor() {
    super("Aborted Request");
    this.name = "AbortedError";
  }
}
