import { isNotNullish, requireNotNullish } from '@rps/wabot-interfaces';

export type RedisClientProductionConfigOptions = {
  urlKey: string;
  passwordKey?: string;
  userNameKey?: string;
};

export class RedisClientProductionConfig {
  readonly url!: string;
  readonly password!: string;
  readonly userName!: string;

  constructor({
    urlKey,
    passwordKey,
    userNameKey,
  }: RedisClientProductionConfigOptions) {
    const url = process.env[urlKey] ?? '';
    // assert(url, `${urlKey} must be set`);
    requireNotNullish(url);
    this.url = url;

    if (passwordKey && isNotNullish(process.env[passwordKey])) {
      this.password = process.env[passwordKey] ?? '';
    }
    if (userNameKey && isNotNullish(process.env[userNameKey])) {
      this.userName = process.env[userNameKey] ?? '';
    }
  }
}
