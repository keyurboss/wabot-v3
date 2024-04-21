export abstract class CoreError extends Error {
  readonly code: string;

  constructor(message: string, scope = 'global') {
    super(message);

    this.code = `${scope}.${this.constructor.name}`;
  }
}
