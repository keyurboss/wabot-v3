import { EntityError } from './entity.error';

type EntityNotFoundErrorWithMessageOptions = {
  message: string;
};

type EntityNotFoundErrorWithNameAndIdOptions = {
  name: string;
  id: string;
};

export class EntityNotFoundError extends EntityError {
  constructor(options: EntityNotFoundErrorWithMessageOptions);
  constructor(options: EntityNotFoundErrorWithNameAndIdOptions);
  constructor(
    options:
      | EntityNotFoundErrorWithMessageOptions
      | EntityNotFoundErrorWithNameAndIdOptions,
  ) {
    let message: string;

    if ('message' in options) {
      message = options.message;
    } else {
      message = `${options.name} identified by ${options.id} not found`;
    }

    super(message);
  }
}
