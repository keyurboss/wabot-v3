import { CoreError } from '../core.error';

export abstract class EntityError extends CoreError {
  constructor(message: string) {
    super(message, 'entity');
  }
}
