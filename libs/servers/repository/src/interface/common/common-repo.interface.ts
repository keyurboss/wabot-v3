import { Filter } from 'mongodb';
import { EntityNotFoundError } from '@rps/bullion-interfaces';
export abstract class CommonRepository<
  TFilter extends Filter<never>,
  TRoot extends object,
  TId extends string,
> {
  rootName = this.constructor.name;
  abstract find(filter?: TFilter): Promise<TRoot[]>;
  abstract findByIds(ids: Array<TId>): Promise<TRoot[]>;

  abstract findOne(id: TId): Promise<TRoot | undefined>;

  abstract save(entity: TRoot): Promise<void>;

  async findOneOrFail(id: TId): Promise<TRoot> {
    const entity = await this.findOne(id);

    if (!entity) {
      throw new EntityNotFoundError({
        message: `${this.rootName} identified by id ${id} not found`,
      });
    }

    return entity;
  }
}
