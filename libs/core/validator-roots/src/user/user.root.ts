import { IUser, UserId } from '@rps/wabot-interfaces';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IsString, IsUUID, Length } from 'class-validator';
import { OmitProperties } from 'ts-essentials';
import { v4 } from 'uuid';
import { BaseEntity } from '../core';

// eslint-disable-next-line @typescript-eslint/ban-types
export type UserOptions = OmitProperties<UserRoot, Function>;

export class UserRoot extends BaseEntity<UserId> implements IUser {
  @Expose()
  @IsString()
  @Length(3, 255)
  name!: string;
  
  @Expose()
  @IsString()
  @Length(5,5)
  refNo!: string;

  @Expose()
  @IsUUID()
  refId!: string;

  @Expose()
  @IsString()
  computeId!: string;
  
  @Expose()
  @IsString()
  number!: string;

  @Expose()
  @Type(() => Date)
  expiresAt!: Date;
  
  static generateID() {
    return v4() as UserId;
  }
  
  static from({
    createdAt = new Date(),
    id,
    modifiedAt = new Date(),
    name,
    refId,
    refNo
 
  }: UserOptions) {
    const entity = new UserRoot();
    entity.id = id;
    entity.name = name;
    entity.createdAt = createdAt;
    entity.modifiedAt = modifiedAt;
    entity.refId = refId;
    entity.refNo = refNo;
    return entity;
  }

  static fromJson(data: Record<string, unknown>) {
    const entity = plainToInstance(UserRoot, data, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
    entity.validate();
    return entity;
  }
}
