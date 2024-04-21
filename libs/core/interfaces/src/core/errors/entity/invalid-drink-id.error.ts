import { EntityError } from './entity.error';

type InvalidDrinkIdOptions = {
  drinkId: string;
};

export class InvalidDrinkIdError extends EntityError {
  constructor(options: InvalidDrinkIdOptions) {
    super(`Invalid drink id ${options.drinkId}`);
  }
}
